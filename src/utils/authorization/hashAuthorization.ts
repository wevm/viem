import type { ErrorType } from '../../errors/utils.js'
import type { AuthorizationRequest } from '../../types/authorization.js'
import type { ByteArray, Hex } from '../../types/misc.js'
import { type ConcatHexErrorType, concatHex } from '../data/concat.js'
import { type HexToBytesErrorType, hexToBytes } from '../encoding/toBytes.js'
import { type NumberToHexErrorType, numberToHex } from '../encoding/toHex.js'
import { type ToRlpErrorType, toRlp } from '../encoding/toRlp.js'
import { type Keccak256ErrorType, keccak256 } from '../hash/keccak256.js'

type To = 'hex' | 'bytes'

export type HashAuthorizationParameters<to extends To> =
  AuthorizationRequest & {
    /** Output format. @default "hex" */
    to?: to | To | undefined
  }

export type HashAuthorizationReturnType<to extends To> =
  | (to extends 'bytes' ? ByteArray : never)
  | (to extends 'hex' ? Hex : never)

export type HashAuthorizationErrorType =
  | Keccak256ErrorType
  | ConcatHexErrorType
  | ToRlpErrorType
  | NumberToHexErrorType
  | HexToBytesErrorType
  | ErrorType

/**
 * Computes an Authorization hash in [EIP-7702 format](https://eips.ethereum.org/EIPS/eip-7702): `keccak256('0x05' || rlp([chain_id, address, nonce]))`.
 */
export function hashAuthorization<to extends To = 'hex'>(
  parameters: HashAuthorizationParameters<to>,
): HashAuthorizationReturnType<to> {
  const { chainId, nonce, to } = parameters
  const address = parameters.contractAddress ?? parameters.address
  const hash = keccak256(
    concatHex([
      '0x05',
      toRlp([
        chainId ? numberToHex(chainId) : '0x',
        address,
        nonce ? numberToHex(nonce) : '0x',
      ]),
    ]),
  )
  if (to === 'bytes') return hexToBytes(hash) as HashAuthorizationReturnType<to>
  return hash as HashAuthorizationReturnType<to>
}
