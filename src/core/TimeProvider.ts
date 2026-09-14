export type TimeProvider = {
  now(): number;
};

export const performanceTimeProvider: TimeProvider = {
  now: () => performance.now(),
};
