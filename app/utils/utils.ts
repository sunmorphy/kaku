import env from "../lib/env";

export function devLog(...args: unknown[]) {
  if (env.nodeEnv === 'development') {
    console.log(...args);
  }
}