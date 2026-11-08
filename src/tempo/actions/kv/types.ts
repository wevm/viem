/**
 * Entry in a Gateway key-value store.
 *
 * @experimental
 */
export type Entry = {
  /** Expiry as a Unix timestamp in milliseconds. */
  expiresAt: number
  /** Key. */
  key: string
  /** JSON value. Validate it before use. */
  value: unknown
  /** Version, incremented on every write. */
  version: number
}
