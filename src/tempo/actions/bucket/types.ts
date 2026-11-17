/**
 * Metadata of an object in a Gateway bucket.
 *
 * @experimental
 */
export type Metadata = {
  /** Content type. */
  contentType: string | null
  /** Entity tag. */
  etag: string
  /** Expiry as a Unix timestamp in milliseconds. */
  expiresAt: number
  /** Object key. */
  key: string
  /** Size in bytes. */
  size: number
  /** Upload time as a Unix timestamp in milliseconds. */
  uploadedAt: number
}
