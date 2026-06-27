import env from "../lib/env";

export function devLog(...args: any[]) {
  if (env.nodeEnv === 'development') {
    console.log(...args);
  }
}