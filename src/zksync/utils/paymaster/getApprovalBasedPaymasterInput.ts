import type { Address } from 'abitype'
import type { ByteArray, Hex } from '../../../types/misc.js'
import {
  type EncodeFunctionDataReturnType,
  encodeFunctionData,
} from '../../../utils/abi/encodeFunctionData.js'
import { bytesToHex } from '../../../utils/encoding/toHex.js'
import { paymasterAbi } from '../../constants/abis.js'

export type GetApprovalBasedPaymasterInputParameters = {
  innerInput: Hex | ByteArray
  minAllowance: bigint
  token: Address
}

export type GetApprovalBasedPaymasterInputReturnType =
  EncodeFunctionDataReturnType

export function getApprovalBasedPaymasterInput(
  parameters: GetApprovalBasedPaymasterInputParameters,
): GetApprovalBasedPaymasterInputReturnType {
  const { innerInput, minAllowance, token } = parameters

  const innerInputHex =
    typeof innerInput === 'string' ? innerInput : bytesToHex(innerInput)

  return encodeFunctionData({
    abi: paymasterAbi,
    functionName: 'approvalBased',
    args: [token, minAllowance, innerInputHex],
  })
}
