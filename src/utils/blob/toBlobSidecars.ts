import type { BlobSidecars } from '../../types/eip4844.js'
import type { Kzg } from '../../types/kzg.js'
import type { ByteArray, Hex } from '../../types/misc.js'
import type { OneOf } from '../../types/utils.js'
import { blobsToCommitments } from './blobsToCommitments.js'
import { toBlobProofs } from './toBlobProofs.js'
import { toBlobs } from './toBlobs.js'

type To = 'hex' | 'bytes'

export type ToBlobSidecarsParameters<
  data extends Hex | ByteArray | undefined = undefined,
  blobs extends Hex[] | ByteArray[] | undefined = undefined,
  to extends To =
    | (blobs extends Hex[] ? 'hex' : never)
    | (blobs extends ByteArray[] ? 'bytes' : never),
  ///
  _blobsType =
    | (blobs extends Hex[] ? Hex[] : never)
    | (blobs extends ByteArray[] ? ByteArray[] : never),
> = {
  /** Return type. */
  to?: to | To | undefined
} & OneOf<
  | {
      /** Data to transform into blobs. */
      data: data | Hex | ByteArray
      /** KZG implementation. */
      kzg: Kzg
    }
  | {
      /** Blobs. */
      blobs: blobs | Hex[] | ByteArray[]
      /** Commitment for each blob. */
      commitments: _blobsType | Hex[] | ByteArray[]
      /** Proof for each blob. */
      proofs: _blobsType | Hex[] | ByteArray[]
    }
>
export type ToBlobSidecarsReturnType<to extends To> =
  | (to extends 'bytes' ? BlobSidecars<ByteArray> : never)
  | (to extends 'hex' ? BlobSidecars<Hex> : never)

export function toBlobSidecars<
  const data extends Hex | ByteArray | undefined = undefined,
  const blobs extends Hex[] | ByteArray[] | undefined = undefined,
  to extends To =
    | (data extends Hex ? 'hex' : never)
    | (data extends ByteArray ? 'bytes' : never)
    | (blobs extends Hex[] ? 'hex' : never)
    | (blobs extends ByteArray[] ? 'bytes' : never),
>(
  parameters: ToBlobSidecarsParameters<data, blobs, to>,
): ToBlobSidecarsReturnType<to> {
  const { data, kzg, to } = parameters
  const blobs = parameters.blobs ?? toBlobs({ data: data!, to })
  const commitments =
    parameters.commitments ?? blobsToCommitments({ blobs, kzg: kzg!, to })
  const proofs =
    parameters.proofs ?? toBlobProofs({ blobs, commitments, kzg: kzg!, to })

  const sidecars: BlobSidecars = []
  for (let i = 0; i < blobs.length; i++)
    sidecars.push({
      blob: blobs[i],
      commitment: commitments[i],
      proof: proofs[i],
    })

  return sidecars as ToBlobSidecarsReturnType<to>
}
