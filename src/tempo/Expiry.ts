/** Returns a unix timestamp `n` days from now. */
export function days(n: number) {
  return Math.floor(Date.now() / 1000) + n * 24 * 60 * 60
}

/** Returns a unix timestamp `n` hours from now. */
export function hours(n: number) {
  return Math.floor(Date.now() / 1000) + n * 60 * 60
}

/** Returns a unix timestamp `n` minutes from now. */
export function minutes(n: number) {
  return Math.floor(Date.now() / 1000) + n * 60
}

/** Returns a unix timestamp `n` months (30 days) from now. */
export function months(n: number) {
  return Math.floor(Date.now() / 1000) + n * 30 * 24 * 60 * 60
}

/** Returns a unix timestamp `n` seconds from now. */
export function seconds(n: number) {
  return Math.floor(Date.now() / 1000) + n
}

/** Returns a unix timestamp `n` weeks from now. */
export function weeks(n: number) {
  return Math.floor(Date.now() / 1000) + n * 7 * 24 * 60 * 60
}

/** Returns a unix timestamp `n` years (365 days) from now. */
export function years(n: number) {
  return Math.floor(Date.now() / 1000) + n * 365 * 24 * 60 * 60
}
