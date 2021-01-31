import { runIPFSDaemon } from './ipfs';
import { startProxyServer } from './proxy';

async function main() {
  const IPFSPort = await runIPFSDaemon();
  startProxyServer(8080, IPFSPort);
}

main();
