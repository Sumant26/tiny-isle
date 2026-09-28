import type { DebugHook } from '../src/app/debugHook';

declare global {
  interface Window {
    __tinyIsle: DebugHook;
  }
}

export {};
