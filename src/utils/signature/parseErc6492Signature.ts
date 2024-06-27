import type { Address } from 'abitype'
import type { ErrorType } from '../../errors/utils.js'
import type { Hex } from '../../types/misc.js'
import type { OneOf, Prettify } from '../../types/utils.js'
import {
  type DecodeAbiParametersErrorType,
  decodeAbiParameters,
} from '../abi/decodeAbiParameters.js'
import {
  type IsErc6492SignatureErrorType,
  isErc6492Signature,
} from './isErc6492Signature.js'

export type ParseErc6492SignatureParameters = Hex

export type ParseErc6492SignatureReturnType = Prettify<
  OneOf<
    | {
        /**
         * The ERC-4337 Account Factory or preparation address to use for counterfactual verification.
         * `undefined` if the signature is not in ERC-6492 format.
         */
        address: Address
        /**
         * Calldata to pass to deploy account (if not deployed) for counterfactual verification.
         * `undefined` if the signature is not in ERC-6492 format.
         */
        data: Hex
        /** The original signature. */
        signature: Hex
      }
    | {
        /** The original signature. */
        signature: Hex
      }
  >
>

export type ParseErc6492SignatureErrorType =
  | IsErc6492SignatureErrorType
  | DecodeAbiParametersErrorType
  | ErrorType

/**
 * @description Parses a hex-formatted ERC-6492 flavoured signature.
 * If the signature is not in ERC-6492 format, then the underlying (original) signature is returned.
 *
 * @param signature ERC-6492 signature in hex format.
 * @returns The parsed ERC-6492 signature.
 *
 * @example
 * parseSignature('0x000000000000000000000000cafebabecafebabecafebabecafebabecafebabe000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000004deadbeef000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000041a461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b000000000000000000000000000000000000000000000000000000000000006492649264926492649264926492649264926492649264926492649264926492')
 * // { address: '0x...', data: '0x...', signature: '0x...' }
 */
export function parseErc6492Signature(
  signature: ParseErc6492SignatureParameters,
): ParseErc6492SignatureReturnType {
  if (!isErc6492Signature(signature)) return { signature }

  const [address, data, signature_] = decodeAbiParameters(
    [{ type: 'address' }, { type: 'bytes' }, { type: 'bytes' }],
    signature,
  )
  return { address, data, signature: signature_ }
}
