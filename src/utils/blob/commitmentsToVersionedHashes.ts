import type { ByteArray, Hex } from '../../types/misc.js'
import { commitmentToVersionedHash } from './commitmentToVersionedHash.js'

type To = 'hex' | 'bytes'

export type CommitmentsToVersionedHashesOptions<to extends To> = {
  to?: to | To
  version?: number
}

export type CommitmentsToVersionedHashesReturnType<to extends To> =
  | (to extends 'bytes' ? ByteArray[] : never)
  | (to extends 'hex' ? Hex[] : never)

export function commitmentsToVersionedHashes<
  const commitments extends Uint8Array[] | Hex[],
  to extends To =
    | (commitments extends Hex[] ? 'hex' : never)
    | (commitments extends ByteArray[] ? 'hex' : never),
>(
  commitments: commitments | Uint8Array[] | Hex[],
  toOrOptions?: to | To | CommitmentsToVersionedHashesOptions<to>,
): CommitmentsToVersionedHashesReturnType<to> {
  const options =
    (typeof toOrOptions === 'string' ? { to: toOrOptions } : toOrOptions) ?? {}
  const to =
    options.to ?? (typeof commitments[0] === 'string' ? 'hex' : 'bytes')

  const hashes: Uint8Array[] | Hex[] = []
  for (const commitment of commitments) {
    hashes.push(
      commitmentToVersionedHash(commitment, {
        to,
        version: options.version,
      }) as any,
    )
  }
  return hashes as CommitmentsToVersionedHashesReturnType<to>
}
