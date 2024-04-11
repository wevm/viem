import { type Address } from 'abitype'
import type { ByteArray, Hex } from '../../../types/misc.js'
import type { EncodeFunctionDataReturnType } from '../../../utils/abi/encodeFunctionData.js'
import { bytesToHex, encodeFunctionData } from '../../../utils/index.js'
import { paymasterAbi } from '../../constants/abis.js'

export type ApprovalBasedPaymasterInput = {
  token: Address
  minimalAllowance: bigint
  innerInput: Hex | ByteArray
}

export function getApprovalBasedPaymasterInput(
  parameters: ApprovalBasedPaymasterInput,
): EncodeFunctionDataReturnType {
  const { token, minimalAllowance, innerInput } =
    parameters as ApprovalBasedPaymasterInput

  const innerInputHex: Hex =
    typeof innerInput === 'string' ? innerInput : bytesToHex(innerInput)

  return encodeFunctionData({
    abi: paymasterAbi,
    functionName: 'approvalBased',
    args: [token, minimalAllowance, innerInputHex],
  })
}
