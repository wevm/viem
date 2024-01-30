import type { ByteArray, Hex } from '../../types/misc.js'
import { bytesToHex } from '../encoding/toHex.js'
import { sha256 } from '../hash/sha256.js'

type To = 'hex' | 'bytes'

export type CommitmentToVersionedHashParameters<
  commitment extends Uint8Array | Hex = Uint8Array | Hex,
  to extends To | undefined = undefined,
> = {
  /** Commitment from blob. */
  commitment: commitment | Uint8Array | Hex
  /** Return type. */
  to?: to | To | undefined
  /** Version to tag onto the hash. */
  version?: number
}

export type CommitmentToVersionedHashReturnType<to extends To> =
  | (to extends 'bytes' ? ByteArray : never)
  | (to extends 'hex' ? Hex : never)

export function commitmentToVersionedHash<
  const commitment extends Hex | ByteArray,
  to extends To =
    | (commitment extends Hex ? 'hex' : never)
    | (commitment extends ByteArray ? 'bytes' : never),
>(
  parameters: CommitmentToVersionedHashParameters<commitment, to>,
): CommitmentToVersionedHashReturnType<to> {
  const { commitment, version = 1 } = parameters
  const to = parameters.to ?? (typeof commitment === 'string' ? 'hex' : 'bytes')

  const versionedHash = sha256(commitment, 'bytes')
  versionedHash.set([version], 0)
  return (
    to === 'bytes' ? versionedHash : bytesToHex(versionedHash)
  ) as CommitmentToVersionedHashReturnType<to>
}
