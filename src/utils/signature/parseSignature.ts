import type { Address } from 'abitype'
import type { Hex } from '../../types/misc.js'
import { decodeAbiParameters } from '../abi/decodeAbiParameters.js'
import { isERC6492Signature } from './isERC6492Signature.js'

export type parseSignatureReturnType = {
  sigToValidate: Hex
  factory?: Address
  factoryCalldata?: Hex
}

export function parseSignature(signature: Hex): parseSignatureReturnType {
  if (!isERC6492Signature(signature)) return { sigToValidate: signature }

  const [factory, factoryCalldata, sigToValidate] = decodeAbiParameters(
    [{ type: 'address' }, { type: 'bytes' }, { type: 'bytes' }],
    signature,
  )
  return { sigToValidate, factory, factoryCalldata }
}
