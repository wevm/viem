import type { Address } from 'abitype'
import type { Hex } from '../../types/misc.js'
import { decodeAbiParameters } from '../abi/decodeAbiParameters.js'
import { isERC6492Signature } from './isERC6492Signature.js'

export type ParseERC6492SignatureReturnType = {
  sigToValidate: Hex
  factory?: Address
  factoryCalldata?: Hex
}

export function parseERC6492Signature(
  signature: Hex,
): ParseERC6492SignatureReturnType {
  if (!isERC6492Signature(signature)) return { sigToValidate: signature }

  const [factory, factoryCalldata, sigToValidate] = decodeAbiParameters(
    [{ type: 'address' }, { type: 'bytes' }, { type: 'bytes' }],
    signature,
  )
  return { sigToValidate, factory, factoryCalldata }
}
