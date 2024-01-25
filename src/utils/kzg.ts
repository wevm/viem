import type { ErrorType } from '../errors/utils.js'
import type { KzgCommitment, KzgProof } from '../types/kzg.js'
import type { ByteArray } from '../types/misc.js'

export type CreateKzgParameters = Kzg
export type CreateKzgReturnType = Kzg
export type CreateKzgErrorType = ErrorType

export type Kzg = {
  /**
   * Convert a blob to a KZG commitment.
   */
  blobToKzgCommitment(blob: ByteArray): KzgCommitment
  /**
   * Given a blob, return the KZG proof that is used to verify it against the
   * commitment.
   */
  computeBlobKzgProof(blob: ByteArray, commitmentBytes: ByteArray): KzgProof
  /**
   * Verify a KZG poof claiming that `p(z) == y`.
   */
  verifyKzgProof(
    proof: ByteArray,
    commitment: ByteArray,
    index: ByteArray,
    value: ByteArray,
  ): boolean
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

export function createKzg({
  blobToKzgCommitment,
  computeBlobKzgProof,
  verifyBlobKzgProofBatch,
  verifyKzgProof,
}: CreateKzgParameters): CreateKzgReturnType {
  return {
    blobToKzgCommitment,
    computeBlobKzgProof,
    verifyKzgProof,
    verifyBlobKzgProofBatch,
  }
}
