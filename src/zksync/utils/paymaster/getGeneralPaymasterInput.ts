import type { ByteArray, Hex } from '../../../types/misc.js'
import type { EncodeFunctionDataReturnType } from '../../../utils/abi/encodeFunctionData.js'
import { bytesToHex, encodeFunctionData } from '../../../utils/index.js'
import { paymasterAbi } from '../../constants/abis.js'

export type GeneralPaymasterInput = {
  innerInput: Hex | ByteArray
}

export function getGeneralPaymasterInput(
  parameters: GeneralPaymasterInput,
): EncodeFunctionDataReturnType {
  const { innerInput } = parameters as GeneralPaymasterInput

  const innerInputHex: Hex =
    typeof innerInput === 'string' ? innerInput : bytesToHex(innerInput)

  return encodeFunctionData({
    abi: paymasterAbi,
    functionName: 'general',
    args: [innerInputHex],
  })
}
