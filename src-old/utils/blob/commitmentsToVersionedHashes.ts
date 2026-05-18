import type { ErrorType } from '../../errors/utils.js'
import type { ByteArray, Hex } from '../../types/misc.js'
import {
  type CommitmentToVersionedHashErrorType,
  commitmentToVersionedHash,
} from './commitmentToVersionedHash.js'

type To = 'hex' | 'bytes'

export type CommitmentsToVersionedHashesParameters<
  commitments extends readonly Uint8Array[] | readonly Hex[] =
    | readonly Uint8Array[]
    | readonly Hex[],
  to extends To | undefined = undefined,
> = {
  /** Commitments from blobs. */
  commitments: commitments | readonly Uint8Array[] | readonly Hex[]
  /** Return type. */
  to?: to | To | undefined
  /** Version to tag onto the hashes. */
  version?: number | undefined
}

export type CommitmentsToVersionedHashesReturnType<to extends To> =
  | (to extends 'bytes' ? readonly ByteArray[] : never)
  | (to extends 'hex' ? readonly Hex[] : never)

export type CommitmentsToVersionedHashesErrorType =
  | CommitmentToVersionedHashErrorType
  | ErrorType

/**
 * Transform a list of commitments to their versioned hashes.
 *
 * @example
 * ```ts
 * import {
 *   blobsToCommitments,
 *   commitmentsToVersionedHashes,
 *   toBlobs
 * } from 'viem'
 * import { kzg } from './kzg'
 *
 * const blobs = toBlobs({ data: '0x1234' })
 * const commitments = blobsToCommitments({ blobs, kzg })
 * const versionedHashes = commitmentsToVersionedHashes({ commitments })
 * ```
 */
export function commitmentsToVersionedHashes<
  const commitments extends readonly Uint8Array[] | readonly Hex[],
  to extends To =
    | (commitments extends readonly Hex[] ? 'hex' : never)
    | (commitments extends readonly ByteArray[] ? 'bytes' : never),
>(
  parameters: CommitmentsToVersionedHashesParameters<commitments, to>,
): CommitmentsToVersionedHashesReturnType<to> {
  const { commitments, version } = parameters

  const to =
    parameters.to ?? (typeof commitments[0] === 'string' ? 'hex' : 'bytes')

  const hashes: Uint8Array[] | Hex[] = []
  for (const commitment of commitments) {
    hashes.push(
      commitmentToVersionedHash({
        commitment,
        to,
        version,
      }) as any,
    )
  }
  return hashes as any
}
