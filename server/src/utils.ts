import { LogEvent } from "../native";

interface DeferredPromise<T> extends Promise<T> {
  resolve(data: T): void;
  reject(reason: any): void;
}

export function createDeferredPromise<T>(): DeferredPromise<T> {
  let resolve!: (d: T) => void;
  let reject!: (r: any) => void;
  const promise = new Promise<T>((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  return Object.assign(promise, {
    resolve,
    reject,
  });
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function formatLogEvent(ev: LogEvent) {
  const time = new Date(ev.time * 1000).toUTCString();
  switch (ev.kind) {
    case "created":
      return `${time} - CREATED`;
    case "enabled":
      return `${time} - ACTIVATED`;
    case "disabled":
      return `${time} - DISABLED`;
    case "req":
      return `${time} - PROXY ${ev.endpoint}`;
  }
}
