import type { Hex } from './misc.js'

export type WrapperPropertiesEIP4844 = {
  /** The blobs associated with a transaction. */
  blobs: Hex[]
  /** The KZG commitments corresponding to each blob. */
  kzgCommitments: Hex[]
  /** The KZG proofs corresponding to each blob and it's commitment. */
  kzgProofs: Hex[]
}
