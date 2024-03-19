import type { ErrorType } from '../../errors/utils.js'
import type { Kzg } from '../../types/kzg.js'
import type { ByteArray, Hex } from '../../types/misc.js'
import { type HexToBytesErrorType, hexToBytes } from '../encoding/toBytes.js'
import { type BytesToHexErrorType, bytesToHex } from '../encoding/toHex.js'

type To = 'hex' | 'bytes'

export type BlobsToCommitmentsParameters<
  blobs extends ByteArray[] | Hex[] = ByteArray[] | Hex[],
  to extends To | undefined = undefined,
> = {
  /** Blobs to transform into commitments. */
  blobs: blobs | ByteArray[] | Hex[]
  /** KZG implementation. */
  kzg: Pick<Kzg, 'blobToKzgCommitment'>
  /** Return type. */
  to?: to | To | undefined
}

export type BlobsToCommitmentsReturnType<to extends To> =
  | (to extends 'bytes' ? ByteArray[] : never)
  | (to extends 'hex' ? Hex[] : never)

export type BlobsToCommitmentsErrorType =
  | HexToBytesErrorType
  | BytesToHexErrorType
  | ErrorType

/**
 * Compute commitments from a list of blobs.
 *
 * @example
 * ```ts
 * import { blobsToCommitments, toBlobs } from 'viem'
 * import { kzg } from './kzg'
 *
 * const blobs = toBlobs({ data: '0x1234' })
 * const commitments = blobsToCommitments({ blobs, kzg })
 * ```
 */
export function blobsToCommitments<
  const blobs extends ByteArray[] | Hex[],
  to extends To =
    | (blobs extends Hex[] ? 'hex' : never)
    | (blobs extends ByteArray[] ? 'bytes' : never),
>(
  parameters: BlobsToCommitmentsParameters<blobs, to>,
): BlobsToCommitmentsReturnType<to> {
  const { kzg } = parameters

  const to =
    parameters.to ?? (typeof parameters.blobs[0] === 'string' ? 'hex' : 'bytes')
  const blobs = (
    typeof parameters.blobs[0] === 'string'
      ? parameters.blobs.map((x) => hexToBytes(x as any))
      : parameters.blobs
  ) as ByteArray[]

  const commitments: ByteArray[] = []
  for (const blob of blobs)
    commitments.push(Uint8Array.from(kzg.blobToKzgCommitment(blob)))

  return (to === 'bytes'
    ? commitments
    : commitments.map((x) =>
        bytesToHex(x),
      )) as {} as BlobsToCommitmentsReturnType<to>
}
