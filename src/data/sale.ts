export const BLACK_FRIDAY = {
  code: 'BF26FLOAT',
  percentOff: 40,
  startsAt: '2026-11-26T00:00:00Z',
  // Exclusive bound: the end of 1 Dec in US Pacific time.
  endsAt: '2026-12-02T08:00:00Z',
  sisterCode: 'BF26PEEK',
  sisterUrl: 'https://www.datapeek.dev/pricing',
} as const;

export type Sale = typeof BLACK_FRIDAY;

export function saleIsLive(now: Date): boolean {
  const t = now.getTime();
  return t >= Date.parse(BLACK_FRIDAY.startsAt) && t < Date.parse(BLACK_FRIDAY.endsAt);
}

// Integer maths first so 499 * 60 / 100 floors to 299 without float drift.
export function salePriceCents(cents: number, percentOff: number): number {
  return Math.floor((cents * (100 - percentOff)) / 100);
}
