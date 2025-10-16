import type { ErrorType } from '../../errors/utils.js'
import type { Kzg } from '../../types/kzg.js'
import type { ByteArray, Hex } from '../../types/misc.js'
import { type HexToBytesErrorType, hexToBytes } from '../encoding/toBytes.js'
import { type BytesToHexErrorType, bytesToHex } from '../encoding/toHex.js'

type To = 'hex' | 'bytes'

export type BlobVersion = '4844' | '7594'

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
  kzg: Pick<Kzg, 'computeBlobKzgProof' | 'computeCellsAndKzgProofs'>
  /** Return type. */
  to?: to | To | undefined
  /** Blob version (EIP-4844 or EIP-7594). Defaults to '4844'. */
  blobVersion?: BlobVersion | undefined
}

export type blobsToProofsReturnType<to extends To> =
  | (to extends 'bytes' ? ByteArray[][] : never)
  | (to extends 'hex' ? Hex[][] : never)

export type blobsToProofsErrorType =
  | BytesToHexErrorType
  | HexToBytesErrorType
  | ErrorType

/**
 * Compute the proofs for a list of blobs and their commitments.
 *
 * Returns an array of proof arrays, where each inner array contains the proofs for one blob:
 * - EIP-4844: Each blob has 1 proof
 * - EIP-7594: Each blob has 128 cell proofs
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
 * // proofs = [[proof1], [proof2]] - one proof per blob
 * ```
 *
 * @example
 * ```ts
 * // EIP-7594 (PeerDAS) blobs
 * import {
 *   blobsToCommitments,
 *   toBlobs
 * } from 'viem'
 * import { kzg } from './kzg'
 *
 * const blobs = toBlobs({ data: '0x1234' })
 * const commitments = blobsToCommitments({ blobs, kzg })
 * const proofs = blobsToProofs({ blobs, commitments, kzg, blobVersion: '7594' })
 * // proofs = [[proof1, proof2, ...proof128], [proof129, ...]] - 128 proofs per blob
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
  const { kzg, blobVersion = '4844' } = parameters

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

  const proofs: ByteArray[][] = []

  if (blobVersion === '7594') {
    // EIP-7594: Use computeCellsAndKzgProofs and return cell proofs for each blob
    if (!kzg.computeCellsAndKzgProofs) {
      throw new Error(
        'KZG implementation does not support computeCellsAndKzgProofs (required for EIP-7594)',
      )
    }
    for (let i = 0; i < blobs.length; i++) {
      const blob = blobs[i]
      const [_cells, cellProofs] = kzg.computeCellsAndKzgProofs(blob)
      // Each blob gets its own array of cell proofs
      proofs.push(cellProofs)
    }
  } else {
    // EIP-4844: Use computeBlobKzgProof (one proof per blob, wrapped in array)
    for (let i = 0; i < blobs.length; i++) {
      const blob = blobs[i]
      const commitment = commitments[i]
      proofs.push([Uint8Array.from(kzg.computeBlobKzgProof(blob, commitment))])
    }
  }

  return (to === 'bytes'
    ? proofs
    : proofs.map((blobProofs) =>
        blobProofs.map((proof) => bytesToHex(proof)),
      )) as {} as blobsToProofsReturnType<to>
}
