import type { ErrorType } from '../../errors/utils.js'
import type { ByteArray, Hex } from '../../types/misc.js'
import {
  type CommitmentToVersionedHashErrorType,
  commitmentToVersionedHash,
} from './commitmentToVersionedHash.js'

type To = 'hex' | 'bytes'

export type CommitmentsToVersionedHashesParameters<
  commitments extends Uint8Array[] | Hex[] = Uint8Array[] | Hex[],
  to extends To | undefined = undefined,
> = {
  /** Commitments from blobs. */
  commitments: commitments | Uint8Array[] | Hex[]
  /** Return type. */
  to?: to | To | undefined
  /** Version to tag onto the hashes. */
  version?: number
}

export type CommitmentsToVersionedHashesReturnType<to extends To> =
  | (to extends 'bytes' ? ByteArray[] : never)
  | (to extends 'hex' ? Hex[] : never)

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
  const commitments extends Uint8Array[] | Hex[],
  to extends To =
    | (commitments extends Hex[] ? 'hex' : never)
    | (commitments extends ByteArray[] ? 'bytes' : never),
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
  return hashes as CommitmentsToVersionedHashesReturnType<to>
}
