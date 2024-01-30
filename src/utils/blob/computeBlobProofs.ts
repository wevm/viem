import type { Kzg } from '../../types/kzg.js'
import type { ByteArray, Hex } from '../../types/misc.js'
import { hexToBytes } from '../encoding/toBytes.js'
import { bytesToHex } from '../encoding/toHex.js'

type To = 'hex' | 'bytes'

export type ComputeBlobProofsReturnType<to extends To> =
  | (to extends 'bytes' ? ByteArray[] : never)
  | (to extends 'hex' ? Hex[] : never)

export function computeBlobProofs<
  const blobs extends ByteArray[] | Hex[],
  const commitments extends ByteArray[] | Hex[],
  to extends To =
    | (blobs extends Hex[] ? 'hex' : never)
    | (blobs extends ByteArray[] ? 'bytes' : never),
  ///
  blobsType =
    | (blobs extends Hex[] ? Hex[] : never)
    | (blobs extends ByteArray[] ? ByteArray[] : never),
>(
  blobs_: blobs,
  commitments_: commitments &
    (commitments extends blobsType
      ? {}
      : 'commitments must be the same type as blobs'),
  kzg: Pick<Kzg, 'computeBlobKzgProof'>,
  to_?: to | To | undefined,
): ComputeBlobProofsReturnType<to> {
  const to = to_ ?? (typeof blobs_[0] === 'string' ? 'hex' : 'bytes')

  const blobs = (
    typeof blobs_[0] === 'string'
      ? blobs_.map((x) => hexToBytes(x as any))
      : blobs_
  ) as ByteArray[]
  const commitments = (
    typeof commitments_[0] === 'string'
      ? commitments_.map((x) => hexToBytes(x as any))
      : commitments_
  ) as ByteArray[]

  const proofs: ByteArray[] = []
  for (let i = 0; i < blobs.length; i++) {
    const blob = blobs[i]
    const commitment = commitments[i]
    proofs.push(Uint8Array.from(kzg.computeBlobKzgProof(blob, commitment)))
  }

  return (to === 'bytes'
    ? proofs
    : proofs.map((x) => bytesToHex(x))) as {} as ComputeBlobProofsReturnType<to>
}
