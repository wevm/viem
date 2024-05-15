import type { ByteArray, Hex } from '../../../types/misc.js'
import type { EncodeFunctionDataReturnType } from '../../../utils/abi/encodeFunctionData.js'
import { bytesToHex, encodeFunctionData } from '../../../utils/index.js'
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
