import { RequestContext } from "./server";
import db from "./db";
import { sign } from "./auth";
import { ForbiddenError } from "apollo-server-express";
import { APIKeyIdentifier } from "../native/index";
import { formatLogEvent } from "./utils";
import pubsub from "./pubsub";

interface AuthInput {
  username: string;
  password: string;
}

interface AuthArgs {
  input: AuthInput;
}

const resolvers = {
  AuthResult: {
    __resolveType(obj: any) {
      if (obj.token) {
        return "AuthResultOk";
      }
      if (obj.message) {
        return "AuthResultErr";
      }
      return null;
    },
  },
  Query: {
    ownedAPIKeys(_: unknown, args: {}, context: RequestContext) {
      if (!context.uid) throw new ForbiddenError("Invalid token.");
      return db.queryUserAPIKeys(context.uid);
    },
    metricsSnapshot(_: unknown, args: { key: APIKeyIdentifier }, context: RequestContext) {
      if (!context.uid) throw new ForbiddenError("Invalid token.");
      const result = db.getMetricsSnapshot(args.key, context.uid);
      if (!result) throw new ForbiddenError("Access denied.");
      return {
        min: result[0],
        hour: result[1],
        day: result[2],
      };
    },
    log(_: unknown, args: { key: APIKeyIdentifier }, context: RequestContext) {
      if (!context.uid) throw new ForbiddenError("Invalid token.");
      return db.getLog(args.key, context.uid)?.map(formatLogEvent).join("\n");
    },
  },
  Mutation: {
    createAPIKey(_: unknown, args: { name: string }, context: RequestContext) {
      if (!context.uid) throw new ForbiddenError("Invalid token.");
      const key = db.createNewAPIKey(context.uid, args.name);
      if (!key) throw new Error("Operation failed.");
      return {
        key,
        name: args.name,
        is_enabled: true,
      };
    },
    updateStatus(
      _: unknown,
      args: { key: APIKeyIdentifier; is_enabled: boolean },
      context: RequestContext
    ) {
      if (!context.uid) throw new ForbiddenError("Invalid token.");
      return db.setStatus(args.key, context.uid, args.is_enabled);
    },
    signUp(_: unknown, args: AuthArgs, context: RequestContext) {
      // TODO(qti3e) Validate stuff.
      const uid = db.createNewUser(args.input.username, args.input.password);
      if (uid) {
        return { token: sign(uid) };
      } else {
        return { message: "Username already exists." };
      }
    },
    signIn(_: unknown, args: AuthArgs, context: RequestContext) {
      const uid = db.auth(args.input.username, args.input.password);
      if (uid) {
        return { token: sign(uid) };
      } else {
        return { message: "Invalid credentials." };
      }
    },
  },
  Subscription: {
    log(_: unknown, args: { key: APIKeyIdentifier }, context: RequestContext) {
      const uid = context.uid;
      // TODO(qti3e) Use another way to prove the ownership of this API-Key instead of
      // getMetricsSnapshot.
      if (!uid || !db.getMetricsSnapshot(args.key, uid)) throw new ForbiddenError("Invalid token.");
      return pubsub.asyncIterator(args.key);
    },
  },
};

export default resolvers;
