import type { ByteArray, Hex } from '../../../types/misc.js'
import {
  type EncodeFunctionDataReturnType,
  encodeFunctionData,
} from '../../../utils/abi/encodeFunctionData.js'
import { bytesToHex } from '../../../utils/encoding/toHex.js'
import { paymasterAbi } from '../../constants/abis.js'

export type GetGeneralPaymasterInputParameters = {
  innerInput: Hex | ByteArray
}

export type GetGeneralPaymasterInputReturnType = EncodeFunctionDataReturnType

export function getGeneralPaymasterInput(
  parameters: GetGeneralPaymasterInputParameters,
): GetGeneralPaymasterInputReturnType {
  const { innerInput } = parameters

  const innerInputHex =
    typeof innerInput === 'string' ? innerInput : bytesToHex(innerInput)

  return encodeFunctionData({
    abi: paymasterAbi,
    functionName: 'general',
    args: [innerInputHex],
  })
}
