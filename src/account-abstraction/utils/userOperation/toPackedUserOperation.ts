import { concat } from '../../../utils/data/concat.js'
import { pad } from '../../../utils/data/pad.js'
import { numberToHex } from '../../../utils/index.js'
import type {
  PackedUserOperation,
  UserOperation,
} from '../../types/userOperation.js'
import { getInitCode } from './getInitCode.js'

export type ToPackedUserOperationOptions = {
  /** Prepare the packed user operation for hashing. */
  forHash?: boolean | undefined
}

export function toPackedUserOperation(
  userOperation: UserOperation,
  options: ToPackedUserOperationOptions = {},
): PackedUserOperation {
  const {
    callGasLimit,
    callData,
    maxPriorityFeePerGas,
    maxFeePerGas,
    paymaster,
    paymasterData,
    paymasterPostOpGasLimit,
    paymasterSignature,
    paymasterVerificationGasLimit,
    sender,
    signature = '0x',
    verificationGasLimit,
  } = userOperation as UserOperation & { paymasterSignature?: string }

  const accountGasLimits = concat([
    pad(numberToHex(verificationGasLimit || 0n), { size: 16 }),
    pad(numberToHex(callGasLimit || 0n), { size: 16 }),
  ])
  const initCode = getInitCode(userOperation, options)

  const gasFees = concat([
    pad(numberToHex(maxPriorityFeePerGas || 0n), { size: 16 }),
    pad(numberToHex(maxFeePerGas || 0n), { size: 16 }),
  ])
  const nonce = userOperation.nonce ?? 0n

  // For v0.9, paymasterSignature can be provided separately and appended after paymasterData
  const paymasterAndData = paymaster
    ? concat([
        paymaster,
        pad(numberToHex(paymasterVerificationGasLimit || 0n), {
          size: 16,
        }),
        pad(numberToHex(paymasterPostOpGasLimit || 0n), {
          size: 16,
        }),
        paymasterData || '0x',
        ...(paymasterSignature ? [paymasterSignature as `0x${string}`] : []),
      ])
    : '0x'
  const preVerificationGas = userOperation.preVerificationGas ?? 0n

  return {
    accountGasLimits,
    callData,
    initCode,
    gasFees,
    nonce,
    paymasterAndData,
    preVerificationGas,
    sender,
    signature,
  }
}
