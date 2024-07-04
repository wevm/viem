import type { Address } from 'abitype'
import { erc6492MagicBytes } from '../../constants/bytes.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Hex } from '../../types/misc.js'
import { encodeAbiParameters } from '../abi/encodeAbiParameters.js'
import { concatHex } from '../data/concat.js'

export type SerializeErc6492SignatureParameters = {
  /** The ERC-4337 Account Factory address to use for counterfactual verification. */
  address: Address
  /** Calldata to pass to deploy account (if not deployed) for counterfactual verification. */
  data: Hex
  /** The original signature. */
  signature: Hex
}

export type SerializeErc6492SignatureReturnType = Hex

export type SerializeErc6492SignatureErrorType = ErrorType

/**
 * @description Serializes a ERC-6492 flavoured signature into hex format.
 *
 * @param signature ERC-6492 signature in object format.
 * @returns ERC-6492 signature in hex format.
 *
 * @example
 * serializeSignature({ address: '0x...', data: '0x...', signature: '0x...' })
 * // '0x000000000000000000000000cafebabecafebabecafebabecafebabecafebabe000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000004deadbeef000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000041a461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b000000000000000000000000000000000000000000000000000000000000006492649264926492649264926492649264926492649264926492649264926492'
 */
export function serializeErc6492Signature(
  parameters: SerializeErc6492SignatureParameters,
): SerializeErc6492SignatureReturnType {
  const { address, data, signature } = parameters
  return concatHex([
    encodeAbiParameters(
      [{ type: 'address' }, { type: 'bytes' }, { type: 'bytes' }],
      [address, data, signature],
    ),
    erc6492MagicBytes,
  ])
}
