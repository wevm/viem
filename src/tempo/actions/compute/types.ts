/**
 * GPU types a Gateway sandbox can run on.
 *
 * @experimental
 */
export type Gpu =
  | 'A100-40GB'
  | 'A100-80GB'
  | 'A10G'
  | 'B200'
  | 'H100'
  | 'H200'
  | 'L4'
  | 'L40S'
  | 'T4'

/**
 * Gateway sandbox.
 *
 * @experimental
 */
export type Sandbox = {
  /** Creation time as a Unix timestamp in milliseconds. */
  createdAt: number
  /** End of the paid lifetime as a Unix timestamp in milliseconds. */
  expiresAt: number
  /** GPU, such as `H100` or `H100:2`, or `null` on CPU. */
  gpu: string | null
  /** Container image, or the snapshot it started from. */
  image: string
  /** End of the paid lease as a Unix timestamp in milliseconds. */
  paidUntil: number
  /** Sandbox ID. */
  sandboxId: string
}
