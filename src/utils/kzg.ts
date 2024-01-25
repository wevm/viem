import type { ErrorType } from '../errors/utils.js'
import type { KzgCommitment, KzgProof } from '../types/kzg.js'
import type { ByteArray } from '../types/misc.js'

export type DefineKzgParameters = Kzg
export type DefineKzgReturnType = Kzg
export type DefineKzgErrorType = ErrorType

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

export function defineKzg({
  blobToKzgCommitment,
  computeBlobKzgProof,
  verifyBlobKzgProofBatch,
  verifyKzgProof,
}: DefineKzgParameters): DefineKzgReturnType {
  return {
    blobToKzgCommitment,
    computeBlobKzgProof,
    verifyKzgProof,
    verifyBlobKzgProofBatch,
  }
}

export type SetupKzgOptions = DefineKzgParameters & {
  loadTrustedSetup(path: string): void
}

export function setupKzg(path: string, options: SetupKzgOptions): Kzg {
  try {
    options.loadTrustedSetup(path)
  } catch (e) {
    const error = e as Error
    if (!error.message.includes('trusted setup is already loaded')) throw error
  }
  return defineKzg(options)
}
