import type { Kzg } from '../../types/kzg.js'
import type { ByteArray, Hex } from '../../types/misc.js'
import { hexToBytes } from '../encoding/toBytes.js'
import { bytesToHex } from '../encoding/toHex.js'

type To = 'hex' | 'bytes'

export type BlobsToCommitmentsReturnType<to extends To> =
  | (to extends 'bytes' ? ByteArray[] : never)
  | (to extends 'hex' ? Hex[] : never)

export function blobsToCommitments<
  const blobs extends ByteArray[] | Hex[],
  to extends To =
    | (blobs extends Hex[] ? 'hex' : never)
    | (blobs extends ByteArray[] ? 'bytes' : never),
>(
  blobs_: blobs | ByteArray[] | Hex[],
  kzg: Pick<Kzg, 'blobToKzgCommitment'>,
  to_?: to | To | undefined,
): BlobsToCommitmentsReturnType<to> {
  const to = to_ ?? (typeof blobs_[0] === 'string' ? 'hex' : 'bytes')
  const blobs = (
    typeof blobs_[0] === 'string'
      ? blobs_.map((x) => hexToBytes(x as any))
      : blobs_
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
