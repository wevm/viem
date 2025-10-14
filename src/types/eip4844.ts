import type { ByteArray, Hex } from './misc.js'

export type BlobSidecar<type extends Hex | ByteArray = Hex | ByteArray> = {
  /** The blob associated with the transaction. */
  blob: type
  /** The KZG commitment corresponding to this blob. */
  commitment: type
  /**
   * The KZG proof(s) corresponding to this blob and commitment.
   * - EIP-4844: Single proof
   * - EIP-7594: Array of cell proofs (128 proofs)
   */
  proof: type | type[]
}
export type BlobSidecars<type extends Hex | ByteArray = Hex | ByteArray> =
  BlobSidecar<type>[]
