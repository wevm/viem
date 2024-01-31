import type { Address } from 'abitype'
import type { LocalAccount } from './account.js'
import type { ByteArray } from './misc.js'
import type { MaybeRequired } from './utils.js'

export type Kzg = {
  /**
   * Convert a blob to a KZG commitment.
   */
  blobToKzgCommitment(blob: ByteArray): ByteArray
  /**
   * Given a blob, return the KZG proof that is used to verify it against the
   * commitment.
   */
  computeBlobKzgProof(blob: ByteArray, commitment: ByteArray): ByteArray
  /**
   * Given an array of blobs and their proofs, verify that they corresponds to their
   * provided commitment.
   */
  verifyBlobKzgProofBatch(
    blobs: ByteArray[],
    commitments: ByteArray[],
    proofs: ByteArray[],
  ): boolean
}

export type GetTransactionRequestKzgParameter<request> = MaybeRequired<
  {
    /** KZG implementation */
    kzg?: Kzg
  },
  request extends { account: LocalAccount<string, Address>; type: 'eip4844' }
    ? true
    : false
>
