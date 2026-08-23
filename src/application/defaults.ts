import type { ClockPort, IdGeneratorPort, RandomPort, SoundPort } from "./ports";

export class SystemClock implements ClockPort {
  now(): number {
    return Date.now();
  }
  setTimer(callback: () => void, delayMs: number): unknown {
    return window.setTimeout(callback, delayMs);
  }
  clearTimer(timer: unknown): void {
    window.clearTimeout(Number(timer));
  }
}

export class BrowserIdGenerator implements IdGeneratorPort {
  next(prefix: string): string {
    return `${prefix}-${crypto.randomUUID()}`;
  }
}

export class SeededRandom implements RandomPort {
  private state: number;
  constructor(seed: number) {
    this.state = seed >>> 0 || 1;
  }
  next(): number {
    this.state = (this.state * 1_664_525 + 1_013_904_223) >>> 0;
    return this.state / 0x1_0000_0000;
  }
}

export function hashSeed(value: string): number {
  let hash = 2_166_136_261;
  for (const character of value) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16_777_619);
  }
  return hash >>> 0;
}

export const silentSound: SoundPort = { play() {} };
