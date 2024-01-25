import type { ByteArray } from './misc.js'

export type KzgCommitment = ByteArray
export type KzgProof = ByteArray
export type ProofResult = [ByteArray, ByteArray]

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
