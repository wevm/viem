import type { Address } from 'abitype'
import type { LocalAccount } from './account.js'
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
}

export type GetTransactionRequestKzgParameter<
  request extends unknown | undefined = undefined,
> = MaybeRequired<
  {
    /** KZG implementation */
    kzg?: Kzg
  },
  request extends {
    account: LocalAccount<string, Address>
    blobs: TransactionRequestEIP4844['blobs']
  }
    ? true
    : false
>
