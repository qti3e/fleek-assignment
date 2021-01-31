import ProgressBar from "progress";
import IpfsHttpClient from "ipfs-http-client";
import { createDeferredPromise, sleep } from "./utils";
import os = require("os");
import path = require("path");
import download = require("download");
import unzipper = require("unzipper");
import tar = require("tar-fs");
import mkdirp = require("mkdirp");
import gunzip = require("gunzip-maybe");
import ChildProcess = require("child_process");
import util = require("util");
import fs = require("fs");
import getPort = require("get-port");

// This module is responsible for installing the IPFS server and making sure that the IPFS daemon
// is running.

// Directory to use for extracting the IPFS dist archive.
const IPFS_DOWNLOAD_DIR = path.join(__dirname, "..", "ipfs");
const execFile = util.promisify(ChildProcess.execFile);

/**
 * Return the downloaded ipfs executable path.
 */
function getIPFSBinaryPath() {
  const ext = os.platform() === "win32" ? ".exe" : "";
  return path.join(IPFS_DOWNLOAD_DIR, "go-ipfs", "ipfs" + ext);
}

/**
 * Download the distribution package for IPFS v0.7.0 from `dist.ipfs.io` and unarchive it.
 */
async function downloadBinary(): Promise<void> {
  const downloadLinks: Record<string, string> = {
    darwin: "https://dist.ipfs.io/go-ipfs/v0.7.0/go-ipfs_v0.7.0_darwin-amd64.tar.gz",
    linux: "https://dist.ipfs.io/go-ipfs/v0.7.0/go-ipfs_v0.7.0_linux-amd64.tar.gz",
    win32: "https://dist.ipfs.io/go-ipfs/v0.7.0/go-ipfs_v0.7.0_windows-amd64.zip",
  };

  const platform = os.platform();
  if (!(platform in downloadLinks))
    throw new Error(
      `Auto-install for platform '${platform}' is not supported, please install IPFS manually.`
    );

  const url = downloadLinks[platform];
  const bar = new ProgressBar("Downloading IPFS [:bar] :percent :etas", {
    complete: "=",
    head: ">",
    incomplete: " ",
    width: 60,
    total: 0,
  });

  const stream = download(url).on("response", (res) => {
    bar.total = res.headers["content-length"];
    res.on("data", (data: Buffer) => bar.tick(data.length));
  });

  // Make sure that the `target` directory exists.
  await mkdirp(IPFS_DOWNLOAD_DIR);
  let extractorPipe: import("stream").Writable;

  if (url.endsWith("zip")) {
    extractorPipe = stream.pipe(unzipper.Extract({ path: IPFS_DOWNLOAD_DIR }));
  } else {
    // assume .tar.gz
    extractorPipe = stream.pipe(gunzip()).pipe(tar.extract(IPFS_DOWNLOAD_DIR));
  }

  // Create a deferred promise that will be resolved once the download & un-archive are finished.
  const pipeFinishPromise = createDeferredPromise<null>();

  extractorPipe.once("error", (e) => {
    pipeFinishPromise.reject(e);
  });

  extractorPipe.once("finish", () => {
    pipeFinishPromise.resolve(null);
  });

  await pipeFinishPromise;
}

/**
 * Check if the IPFS-damon is already running by making a `/version` request to the server.
 * @param port The port to be used. Default `5001`.
 */
async function isIPFSRunning(port: number = 5001): Promise<boolean> {
  const client = IpfsHttpClient({
    host: "localhost",
    port,
    timeout: 1e3,
  });

  try {
    console.log("IPFS version: ", await client.version());
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Check if the `ipfs` command is available.
 */
async function checkIPFSExec(bin: string): Promise<boolean> {
  try {
    await execFile(bin, ["--version"]);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Return the IPFS command that can be used to execute the IPFS binary, if there is a globally
 * installed version it just returns `"ipfs"`, otherwise it downloads the IPFS binary for the
 * current platform and returns its directory.
 *
 * The result of the download is cached.
 */
async function resolveIPFSCommand(): Promise<string> {
  // See if there is a globally installed version.
  if (await checkIPFSExec("ipfs")) return "ipfs";

  const localExecPath = getIPFSBinaryPath();
  const finishedMarkerPath = path.join(IPFS_DOWNLOAD_DIR, ".finished");

  // Only attempt to execute the binary if the `.finished` file exists, it is a file that we
  // write after the first download is finished, we don't want to execute corrupt binary!
  let alreadyDownloaded = true;
  try {
    await fs.promises.access(finishedMarkerPath, fs.constants.F_OK);
  } catch (e) {
    alreadyDownloaded = false;
  }
  if (alreadyDownloaded) alreadyDownloaded = await checkIPFSExec(localExecPath);
  if (alreadyDownloaded) return localExecPath;

  await downloadBinary();
  await fs.promises.writeFile(finishedMarkerPath, "DO NOT REMOVE THIS FILE.");
  return localExecPath;
}

async function getIPFSConfig(bin: string) {
  return JSON.parse((await execFile(bin, ["config", "show"])).stdout);
}

async function writeIPFSConfig(bin: string, config: any) {
  const configPath = path.join(os.tmpdir(), "ipfs.fleek.config.json");
  await fs.promises.writeFile(configPath, JSON.stringify(config, null, 4));
  await execFile(bin, ["config", "replace", configPath]);
}

/**
 * Accepts an address like `/ip4/127.0.0.1/tcp/5001` and returns the port.
 * @param address The API address.
 */
function getAddressPort(address: string): number {
  return Number(address.split("/")[4]);
}

/**
 * Return true if the address is not limited to the localhost.
 * @param address The API address.
 */
function isAPIPublic(address: string): boolean {
  return address.startsWith("/ip4/0.0.0.0/") || address.startsWith("/ip6/::/");
}

function runDaemon(bin: string, port: number): Promise<number> {
  const promise = createDeferredPromise<number>();
  const ipfs = ChildProcess.spawn(bin, ["daemon"]);

  ipfs.on("error", async (e) => {
    if (e.message.includes("someone else has the lock")) {
      console.log("IPFS is shutting down, we will retry in 3s");
      await sleep(3e3);
      const result = await runIPFSDaemon();
      promise.resolve(result);
    } else {
      promise.reject(e);
    }
  });

  ipfs.on("exit", () => {
    promise.reject(new Error("Running daemon failed"));
  });

  ipfs.stdout.once("data", async () => {
    await sleep(1e3);
    while (true) {
      if (await isIPFSRunning(port)) {
        console.log(`IPFS is running on port ${port}.`);
        promise.resolve(port);
        break;
      }
    }
  });

  mkdirp(IPFS_DOWNLOAD_DIR).then(() => {
    ipfs.stderr.pipe(fs.createWriteStream(path.join(IPFS_DOWNLOAD_DIR, "stderr.log")));
    ipfs.stdout.pipe(fs.createWriteStream(path.join(IPFS_DOWNLOAD_DIR, "stdout.log")));
  });

  return promise;
}

/**
 * Ensure that the IPFS daemon is running. Returns the port that the IPFS is using on
 * the current machine (Probably `5001`).
 */
export async function runIPFSDaemon(): Promise<number> {
  const bin = await resolveIPFSCommand();

  // Ensure that the IPFS is initialized.
  try {
    await execFile(bin, ["init"]);
  } catch (e) {}

  const config = await getIPFSConfig(bin);
  const APIAddress = config["Addresses"]["API"];
  const port = getAddressPort(APIAddress);
  console.log("Port: ", port);

  if (isAPIPublic(APIAddress)) {
    throw new Error("SecurityError: IPFS HTTP API must not be public.");
  }

  if (await isIPFSRunning(port)) {
    console.log(`IPFS is running on port ${port}.`);
    return port;
  }

  // Try to find a free port, prefer the currently configured port.
  const freePort = await getPort({ port });
  if (freePort !== port) {
    console.log("IPFS port is occupied by another program.");
    const API = `/ip4/127.0.0.1/tcp/${freePort}`;
    config["Addresses"]["API"] = API;
    await writeIPFSConfig(bin, config);
    console.log(`IPFS is now configured to use port ${freePort}`);
  }

  console.log("Running IPFS daemon, it might take a while.");
  return await runDaemon(bin, freePort);
}

runIPFSDaemon();
