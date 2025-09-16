import type { Address } from 'abitype'
import { SignatureErc8010 } from 'ox/erc8010'
import type { ErrorType } from '../../errors/utils.js'
import type { SignedAuthorization } from '../../types/authorization.js'
import type { Hex } from '../../types/misc.js'
import type { OneOf, Prettify } from '../../types/utils.js'
import { numberToHex } from '../encoding/toHex.js'
import {
  type IsErc8010SignatureErrorType,
  isErc8010Signature,
} from './isErc8010Signature.js'

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

  const {
    authorization: authorization_ox,
    to,
    ...rest
  } = SignatureErc8010.unwrap(signature)
  return {
    authorization: {
      address: authorization_ox.address,
      chainId: authorization_ox.chainId,
      nonce: Number(authorization_ox.nonce),
      r: numberToHex(authorization_ox.r, { size: 32 }),
      s: numberToHex(authorization_ox.s, { size: 32 }),
      yParity: authorization_ox.yParity,
    },
    ...(to ? { address: to } : {}),
    ...rest,
  }
}
