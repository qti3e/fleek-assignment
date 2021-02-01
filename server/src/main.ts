import { runIPFSDaemon } from "./ipfs";
import { startProxyServer } from "./proxy";
import startHTTPServer from "./server";

async function main() {
  const IPFSPort = await runIPFSDaemon();
  startProxyServer(8080, IPFSPort);
  startHTTPServer(8081);
}

main();
