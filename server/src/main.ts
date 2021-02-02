import { runIPFSDaemon } from "./ipfs";
import { startProxyServer } from "./proxy";
import startHTTPServer from "./server";

async function main() {
  let IPFSPort: number;
  try {
    IPFSPort = await runIPFSDaemon();
  } catch (e) {
    console.error("Could not run IPFS. Please look at ./server/ipfs/stderr.log for more info.");
    return;
  }
  startProxyServer(8080, IPFSPort);
  startHTTPServer(8081);
}

main();
