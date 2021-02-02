import jwt from "jsonwebtoken";
import { UserID } from "../native/index";

// TODO(qti3e) Load it from .env
const JWT_SECRET = "IT_IS_NOT_SO_SECRET";

export function sign(uid: UserID) {
  return jwt.sign(
    {
      data: uid,
    },
    JWT_SECRET,
    { expiresIn: 8 * 60 * 60 }
  );
}

export function verify(token: string): UserID | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { data: UserID };
    if (typeof decoded.data === "string") return decoded.data;
  } catch (e) {}
  return null;
}

export function parseBearerSchema(header: string): UserID | null {
  if (header.startsWith("Bearer")) return verify(header.slice(7));
  return null;
}
