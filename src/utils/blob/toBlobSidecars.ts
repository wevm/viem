import type { ErrorType } from '../../errors/utils.js'
import type { BlobSidecars } from '../../types/eip4844.js'
import type { Kzg } from '../../types/kzg.js'
import type { ByteArray, Hex } from '../../types/misc.js'
import type { OneOf } from '../../types/utils.js'
import {
  type BlobsToCommitmentsErrorType,
  blobsToCommitments,
} from './blobsToCommitments.js'
import { blobsToProofs, type blobsToProofsErrorType } from './blobsToProofs.js'
import { type ToBlobsErrorType, toBlobs } from './toBlobs.js'

type To = 'hex' | 'bytes'

export type ToBlobSidecarsParameters<
  data extends Hex | ByteArray | undefined = undefined,
  blobs extends readonly Hex[] | readonly ByteArray[] | undefined = undefined,
  to extends To =
    | (blobs extends readonly Hex[] ? 'hex' : never)
    | (blobs extends readonly ByteArray[] ? 'bytes' : never),
  ///
  _blobsType =
    | (blobs extends readonly Hex[] ? readonly Hex[] : never)
    | (blobs extends readonly ByteArray[] ? readonly ByteArray[] : never),
> = {
  /** Return type. */
  to?: to | To | undefined
  /** Blob version (EIP-4844 or EIP-7594). Defaults to '4844'. */
  blobVersion?: '4844' | '7594' | undefined
} & OneOf<
  | {
      /** Data to transform into blobs. */
      data: data | Hex | ByteArray
      /** KZG implementation. */
      kzg: Kzg
    }
  | {
      /** Blobs. */
      blobs: blobs | readonly Hex[] | readonly ByteArray[]
      /** Commitment for each blob. */
      commitments: _blobsType | readonly Hex[] | readonly ByteArray[]
      /** Proof(s) for each blob (array of proof arrays). */
      proofs: readonly (readonly Hex[])[] | readonly (readonly ByteArray[])[]
    }
>

export type ToBlobSidecarsReturnType<to extends To> =
  | (to extends 'bytes' ? BlobSidecars<ByteArray> : never)
  | (to extends 'hex' ? BlobSidecars<Hex> : never)

export type ToBlobSidecarsErrorType =
  | BlobsToCommitmentsErrorType
  | ToBlobsErrorType
  | blobsToProofsErrorType
  | ErrorType

/**
 * Transforms arbitrary data (or blobs, commitments, & proofs) into a sidecar array.
 *
 * @example
 * ```ts
 * import { toBlobSidecars, stringToHex } from 'viem'
 *
 * const sidecars = toBlobSidecars({ data: stringToHex('hello world') })
 * ```
 *
 * @example
 * ```ts
 * import {
 *   blobsToCommitments,
 *   toBlobs,
 *   blobsToProofs,
 *   toBlobSidecars,
 *   stringToHex
 * } from 'viem'
 *
 * const blobs = toBlobs({ data: stringToHex('hello world') })
 * const commitments = blobsToCommitments({ blobs, kzg })
 * const proofs = blobsToProofs({ blobs, commitments, kzg })
 *
 * const sidecars = toBlobSidecars({ blobs, commitments, proofs })
 * ```
 */
export function toBlobSidecars<
  const data extends Hex | ByteArray | undefined = undefined,
  const blobs extends
    | readonly Hex[]
    | readonly ByteArray[]
    | undefined = undefined,
  to extends To =
    | (data extends Hex ? 'hex' : never)
    | (data extends ByteArray ? 'bytes' : never)
    | (blobs extends readonly Hex[] ? 'hex' : never)
    | (blobs extends readonly ByteArray[] ? 'bytes' : never),
>(
  parameters: ToBlobSidecarsParameters<data, blobs, to>,
): ToBlobSidecarsReturnType<to> {
  const { data, kzg, to, blobVersion = '4844' } = parameters
  const blobs = parameters.blobs ?? toBlobs({ data: data!, to })
  const commitments =
    parameters.commitments ?? blobsToCommitments({ blobs, kzg: kzg!, to })
  const proofs =
    parameters.proofs ??
    blobsToProofs({ blobs, commitments, kzg: kzg!, to, blobVersion })

  const sidecars: BlobSidecars = []
  for (let i = 0; i < blobs.length; i++) {
    const blobProofs = proofs[i]
    // For EIP-4844, blobProofs is [single_proof]
    // For EIP-7594, blobProofs is [proof1, proof2, ..., proof128]
    // We store the first proof in the sidecar (for EIP-4844) or all proofs (for EIP-7594)
    sidecars.push({
      blob: blobs[i],
      commitment: commitments[i],
      proof: blobProofs.length === 1 ? blobProofs[0] : [...blobProofs],
    })
  }

  return sidecars as ToBlobSidecarsReturnType<to>
}
