import type { Address } from 'abitype'
import type { ErrorType } from '../../errors/utils.js'
import type { SignedAuthorization } from '../../types/authorization.js'
import type { Hex } from '../../types/misc.js'
import type { OneOf, Prettify } from '../../types/utils.js'
import { decodeAbiParameters } from '../abi/decodeAbiParameters.js'
import { sliceHex } from '../data/slice.js'
import { hexToNumber } from '../encoding/fromHex.js'
import { numberToHex } from '../encoding/toHex.js'
import {
  type IsErc8010SignatureErrorType,
  isErc8010Signature,
} from './isErc8010Signature.js'

/** ABI of the suffix an ERC-8010 wrapped signature carries before its length and magic bytes. */
const suffixParameters = [
  {
    type: 'tuple',
    components: [
      { name: 'chainId', type: 'uint256' },
      { name: 'delegation', type: 'address' },
      { name: 'nonce', type: 'uint256' },
      { name: 'yParity', type: 'uint8' },
      { name: 'r', type: 'uint256' },
      { name: 's', type: 'uint256' },
    ],
  },
  { name: 'to', type: 'address' },
  { name: 'data', type: 'bytes' },
] as const

export type ParseErc8010SignatureParameters = Hex

export type ParseErc8010SignatureReturnType = Prettify<
  OneOf<
    | {
        /** Address of the initializer. */
        address?: Address | undefined
        /** Authorization signed by the delegatee. */
        authorization: SignedAuthorization
        /** Data to initialize the delegation. */
        data?: Hex | undefined
        /** The original signature. */
        signature: Hex
      }
    | {
        /** The original signature. */
        signature: Hex
      }
  >
>

export type ParseErc8010SignatureErrorType =
  | IsErc8010SignatureErrorType
  | ErrorType

/**
 * @description Parses a hex-formatted ERC-8010 flavoured signature.
 * If the signature is not in ERC-8010 format, then the underlying (original) signature is returned.
 *
 * @param signature ERC-8010 signature in hex format.
 * @returns The parsed ERC-8010 signature.
 */
export function parseErc8010Signature(
  signature: ParseErc8010SignatureParameters,
): ParseErc8010SignatureReturnType {
  if (!isErc8010Signature(signature)) return { signature }

  const suffixLength = hexToNumber(sliceHex(signature, -64, -32))
  const [auth, to, data] = decodeAbiParameters(
    suffixParameters,
    sliceHex(signature, -suffixLength - 64, -64),
  )
  // Addresses stay lowercase, as the wrapped signature encodes them.
  return {
    authorization: {
      address: auth.delegation.toLowerCase() as Address,
      chainId: Number(auth.chainId),
      nonce: Number(auth.nonce),
      r: numberToHex(auth.r, { size: 32 }),
      s: numberToHex(auth.s, { size: 32 }),
      yParity: auth.yParity,
    },
    ...(data !== '0x' ? { address: to.toLowerCase() as Address } : {}),
    signature: sliceHex(signature, 0, -suffixLength - 64),
    ...(data !== '0x' ? { data } : {}),
  }
}
