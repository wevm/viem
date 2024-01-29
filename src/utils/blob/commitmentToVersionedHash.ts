import type { ByteArray, Hex } from '../../types/misc.js'
import { bytesToHex } from '../encoding/toHex.js'
import { sha256 } from '../hash/sha256.js'

type To = 'hex' | 'bytes'

export type CommitmentToVersionedHashParameters<
  commitment extends Hex | ByteArray = Hex | ByteArray,
> = {
  commitment: commitment
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
  { commitment, version = 1 }: CommitmentToVersionedHashParameters<commitment>,
  to_?: to | To | undefined,
): CommitmentToVersionedHashReturnType<to> {
  const to = to_ ?? (typeof commitment === 'string' ? 'hex' : 'bytes')
  const versionedHash = sha256(commitment, 'bytes')
  versionedHash.set([version], 0)
  return (
    to === 'bytes' ? versionedHash : bytesToHex(versionedHash)
  ) as CommitmentToVersionedHashReturnType<to>
}
