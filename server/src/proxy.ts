import http = require("http");
import httpProxy = require("http-proxy");
import requestStats = require("request-stats");
import { APIKeyIdentifier } from "../native";
import db from "./db";
import pubsub from "./pubsub";
import { formatLogEvent } from "./utils";

const API_KEY_HEADER = "X-API-KEY";

/**
 * Create a proxy server that handles API Key authentication and forwards request to IPFS API.
 * @param port Port to be used.
 * @param ipfsPort IPFS port to forward requests to. (usually 5001)
 */
export function startProxyServer(port: number, ipfsPort: number) {
  const proxy = httpProxy.createProxyServer({
    target: `http://127.0.0.1:${ipfsPort}`,
  });

  const servedRequests = new WeakMap<http.IncomingMessage, APIKeyIdentifier>();

  const server = http.createServer(function (req, res) {
    const token = req.headers[API_KEY_HEADER];
    if (typeof token === "string" && db.isAPIKeyEnabled(token)) {
      servedRequests.set(req, token);
      delete req.headers[API_KEY_HEADER];
      proxy.web(req, res);
      return;
    }
    res.writeHead(403, { "Content-Type": "text/plain" });
    res.write("Access denied.");
    res.end();
  });

  requestStats(server, (stats) => {
    const { req, res } = stats;
    const token = servedRequests.get(req.raw);
    if (!token) return;
    const bytes = req.bytes + res.bytes;
    db.logRequest(token, req.path, bytes);
    // I don't like this.
    pubsub.publish(
      token,
      formatLogEvent({
        kind: "req" as any,
        endpoint: req.path,
        time: (Date.now() / 1000) | 0,
      })
    );
  });

  server.listen(port, () => {
    console.log(`Proxy server ready at http:/localhost:${port}.`);
  });
}
