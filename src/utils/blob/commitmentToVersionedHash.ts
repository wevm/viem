import type { ByteArray, Hex } from '../../types/misc.js'
import { bytesToHex } from '../encoding/toHex.js'
import { sha256 } from '../hash/sha256.js'

type To = 'hex' | 'bytes'

export type CommitmentToVersionedHashOptions<to extends To> = {
  to?: to | To
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
  commitment: commitment | Hex | ByteArray,
  toOrOptions?: to | To | CommitmentToVersionedHashOptions<to>,
): CommitmentToVersionedHashReturnType<to> {
  const options =
    (typeof toOrOptions === 'string' ? { to: toOrOptions } : toOrOptions) ?? {}
  const to = options.to ?? (typeof commitment === 'string' ? 'hex' : 'bytes')

  const versionedHash = sha256(commitment, 'bytes')
  versionedHash.set([options.version ?? 1], 0)
  return (
    to === 'bytes' ? versionedHash : bytesToHex(versionedHash)
  ) as CommitmentToVersionedHashReturnType<to>
}
