type Opaque<N, T> = T & { __opaque: N };

export type APIKeyIdentifier = Opaque<"APIKeyIdentifier", string>;

export type UserID = Opaque<"UserID", string>;

export interface APIKey {
  key: APIKeyIdentifier,
  is_enabled: boolean,
  name: string
}

export interface Metric {
  req_count: number,
  bytes_transferred: number
}

export type MetricsSnapshot = [minute: Metric, hour: Metric, day: Metric];

declare enum EventKind {
  Created = "created",
  Enabled = "enabled",
  Disabled = "disabled",
  ProxyReq = "req",
}

export type LogEvent =
  | { kind: EventKind.Created; time: number }
  | { kind: EventKind.Enabled; time: number }
  | { kind: EventKind.Disabled; time: number }
  | { kind: EventKind.ProxyReq; time: number; endpoint: string };

/**
 * An specialized DB built on the top of `RocksDB` only for this assignment.
 */
export declare class DB {
  /**
   * Create a new database instance.
   * @param path Path of the directory to be used by the DB.
   */
  constructor(path: string);

  /**
   * Returns `true` if the given API key exists and is enabled.
   * @param key The API-key to lookup.
   */
  isAPIKeyEnabled(key: string): key is APIKeyIdentifier;

  /**
   * Create a new user with the given information.
   * @param username The username to be used.
   * @param password The password to be used.
   */
  createNewUser(username: string, password: string): UserID | null;

  /**
   * Try to authenticate a user by the given credentials.
   * @param username The username.
   * @param password The password.
   */
  auth(username: string, password: string): UserID | null;

  /**
   * Return all of the API-keys owned by the given user.
   *
   * TODO(qti3e): Support Pagination.
   * @param uid ID of the user.
   */
  queryUserAPIKeys(uid: UserID): APIKey[] | null;

  /**
   * Create a new API key with the given information.
   * @param uid ID of the owner.
   * @param name Name of the API-key to help the user identify the API-keys.
   */
  createNewAPIKey(uid: UserID, name: string): APIKeyIdentifier | null;

  /**
   * Change the current status of an API key, the current `uid` must be provided to check
   * if the current user can perform the operation.
   * @param key The API-key.
   * @param user The user who is making the request.
   * @param isEnabled The new status.
   */
  setStatus(key: APIKeyIdentifier, user: UserID, isEnabled: boolean): boolean;

  /**
   * Log a request and store the metrics.
   * @param key The API key that was used for the request.
   * @param endpoint The HTTP endpoint that was accessed.
   * @param bytesTransferred Total number of bytes that was transferred.
   */
  logRequest(key: APIKeyIdentifier, endpoint: string, bytesTransferred: number): boolean;

  getLog(key: APIKeyIdentifier, uid: UserID): LogEvent[] | null;

  getMetricsSnapshot(key: APIKeyIdentifier, uid: UserID): MetricsSnapshot | null;
}
