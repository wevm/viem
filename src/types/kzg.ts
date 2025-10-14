import type { Address } from 'abitype'

import type { LocalAccount } from '../accounts/types.js'
import type { ByteArray } from './misc.js'
import type { TransactionRequestEIP4844 } from './transaction.js'
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
   * Compute cells and their KZG proofs for a blob (EIP-7594).
   * Returns a tuple of [cells, proofs].
   */
  computeCellsAndKzgProofs?(blob: ByteArray): [ByteArray[], ByteArray[]]
}

export type GetTransactionRequestKzgParameter<
  request extends unknown | undefined = undefined,
> = MaybeRequired<
  {
    /** KZG implementation */
    kzg?: Kzg | undefined
  },
  request extends {
    account: LocalAccount<string, Address>
    blobs: TransactionRequestEIP4844['blobs']
  }
    ? true
    : false
>
