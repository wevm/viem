import type { Kzg } from '../../types/kzg.js'
import type { ByteArray, Hex } from '../../types/misc.js'
import { hexToBytes } from '../encoding/toBytes.js'
import { bytesToHex } from '../encoding/toHex.js'

type To = 'hex' | 'bytes'

export type ToBlobProofsParameters<
  blobs extends ByteArray[] | Hex[],
  commitments extends ByteArray[] | Hex[],
  to extends To =
    | (blobs extends Hex[] ? 'hex' : never)
    | (blobs extends ByteArray[] ? 'bytes' : never),
  ///
  _blobsType =
    | (blobs extends Hex[] ? Hex[] : never)
    | (blobs extends ByteArray[] ? ByteArray[] : never),
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

export type toBlobProofsReturnType<to extends To> =
  | (to extends 'bytes' ? ByteArray[] : never)
  | (to extends 'hex' ? Hex[] : never)

export function toBlobProofs<
  const blobs extends ByteArray[] | Hex[],
  const commitments extends ByteArray[] | Hex[],
  to extends To =
    | (blobs extends Hex[] ? 'hex' : never)
    | (blobs extends ByteArray[] ? 'bytes' : never),
>(
  parameters: ToBlobProofsParameters<blobs, commitments, to>,
): toBlobProofsReturnType<to> {
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
    : proofs.map((x) => bytesToHex(x))) as {} as toBlobProofsReturnType<to>
}
