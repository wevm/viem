import type { ErrorType } from '../../errors/utils.js'
import type { Kzg } from '../../types/kzg.js'
import type { ByteArray, Hex } from '../../types/misc.js'
import { type HexToBytesErrorType, hexToBytes } from '../encoding/toBytes.js'
import { type BytesToHexErrorType, bytesToHex } from '../encoding/toHex.js'

type To = 'hex' | 'bytes'

export type blobsToProofsParameters<
  blobs extends readonly ByteArray[] | readonly Hex[],
  commitments extends readonly ByteArray[] | readonly Hex[],
  to extends To =
    | (blobs extends readonly Hex[] ? 'hex' : never)
    | (blobs extends readonly ByteArray[] ? 'bytes' : never),
  ///
  _blobsType =
    | (blobs extends readonly Hex[] ? readonly Hex[] : never)
    | (blobs extends readonly ByteArray[] ? readonly ByteArray[] : never),
> = {
  /** Blobs to transform into proofs. */
  blobs: blobs
  /** Commitments for the blobs. */
  commitments: commitments &
    (commitments extends _blobsType
      ? {}
      : `commitments must be the same type as blobs`)
  /** KZG implementation. */
  kzg: Pick<Kzg, 'computeBlobKzgProof'>
  /** Return type. */
  to?: to | To | undefined
}

export type blobsToProofsReturnType<to extends To> =
  | (to extends 'bytes' ? ByteArray[] : never)
  | (to extends 'hex' ? Hex[] : never)

export type blobsToProofsErrorType =
  | BytesToHexErrorType
  | HexToBytesErrorType
  | ErrorType

/**
 * Compute the proofs for a list of blobs and their commitments.
 *
 * @example
 * ```ts
 * import {
 *   blobsToCommitments,
 *   toBlobs
 * } from 'viem'
 * import { kzg } from './kzg'
 *
 * const blobs = toBlobs({ data: '0x1234' })
 * const commitments = blobsToCommitments({ blobs, kzg })
 * const proofs = blobsToProofs({ blobs, commitments, kzg })
 * ```
 */
export function blobsToProofs<
  const blobs extends readonly ByteArray[] | readonly Hex[],
  const commitments extends readonly ByteArray[] | readonly Hex[],
  to extends To =
    | (blobs extends readonly Hex[] ? 'hex' : never)
    | (blobs extends readonly ByteArray[] ? 'bytes' : never),
>(
  parameters: blobsToProofsParameters<blobs, commitments, to>,
): blobsToProofsReturnType<to> {
  const { kzg } = parameters

  const to =
    parameters.to ?? (typeof parameters.blobs[0] === 'string' ? 'hex' : 'bytes')

  const blobs = (
    typeof parameters.blobs[0] === 'string'
      ? parameters.blobs.map((x) => hexToBytes(x as any))
      : parameters.blobs
  ) as ByteArray[]
  const commitments = (
    typeof parameters.commitments[0] === 'string'
      ? parameters.commitments.map((x) => hexToBytes(x as any))
      : parameters.commitments
  ) as ByteArray[]

  const proofs: ByteArray[] = []
  for (let i = 0; i < blobs.length; i++) {
    const blob = blobs[i]
    const commitment = commitments[i]
    proofs.push(Uint8Array.from(kzg.computeBlobKzgProof(blob, commitment)))
  }

  return (to === 'bytes'
    ? proofs
    : proofs.map((x) => bytesToHex(x))) as {} as blobsToProofsReturnType<to>
}
