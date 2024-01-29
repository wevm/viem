import type { ByteArray, Hex } from '../../types/misc.js'
import { commitmentToVersionedHash } from './commitmentToVersionedHash.js'

type To = 'hex' | 'bytes'

export type CommitmentsToVersionedHashesParameters<
  commitments extends Uint8Array[] | Hex[] = Uint8Array[] | Hex[],
> = {
  commitments: commitments
  version?: number
}

export type CommitmentsToVersionedHashesReturnType<to extends To> =
  | (to extends 'bytes' ? ByteArray[] : never)
  | (to extends 'hex' ? Hex[] : never)

export function commitmentsToVersionedHashes<
  const commitments extends Uint8Array[] | Hex[],
  to extends To =
    | (commitments extends Hex[] ? 'hex' : never)
    | (commitments extends ByteArray[] ? 'bytes' : never),
>(
  {
    commitments,
    version = 1,
  }: CommitmentsToVersionedHashesParameters<commitments>,
  to_?: to | To | undefined,
): CommitmentsToVersionedHashesReturnType<to> {
  const to = to_ ?? (typeof commitments[0] === 'string' ? 'hex' : 'bytes')
  const hashes: Uint8Array[] | Hex[] = []
  for (const commitment of commitments) {
    hashes.push(commitmentToVersionedHash({ commitment, version }, to) as any)
  }
  return hashes as CommitmentsToVersionedHashesReturnType<to>
}
