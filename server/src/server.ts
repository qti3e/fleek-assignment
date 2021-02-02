import express from "express";
import { ApolloServer } from "apollo-server-express";
import schema from "./schema";
import resolvers from "./resolvers";
import { UserID } from "../native/index";
import { parseBearerSchema } from "./auth";
import path = require("path");
import http = require("http");

const PUBLIC_DIR = path.join(__dirname, "../../frontend/build");
const INDEX_URL = path.join(PUBLIC_DIR, "./index.html");

export default function startHTTPServer(port: number) {
  const app = express();
  const server = new ApolloServer({ typeDefs: schema, resolvers, context: contextFn });

  server.applyMiddleware({ app });
  applyRoutes(app);

  const httpServer = http.createServer(app);
  server.installSubscriptionHandlers(httpServer);

  httpServer.listen({ port }, () => {
    console.log(`🚀 Web Server ready at http://localhost:${port}`);
  });
}

function applyRoutes(app: express.Application): void {
  app.use(express.static(PUBLIC_DIR));
  app.get("*", (_, res) => res.sendFile(INDEX_URL));
}

export interface RequestContext {
  uid?: UserID;
}

function contextFn({ req }: { req: express.Request }): RequestContext {
  const ctx: RequestContext = {};

  // Perform the authentication if a token is provided.
  const token = req.headers.authorization || "";
  const uid = parseBearerSchema(token);
  if (uid) ctx.uid = uid;

  return ctx;
}
