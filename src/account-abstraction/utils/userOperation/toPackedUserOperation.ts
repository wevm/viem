import { concat } from '../../../utils/data/concat.js'
import { pad } from '../../../utils/data/pad.js'
import { numberToHex } from '../../../utils/index.js'
import type {
  PackedUserOperation,
  UserOperation,
} from '../../types/userOperation.js'

export function toPackedUserOperation(
  userOperation: UserOperation,
): PackedUserOperation {
  const {
    callGasLimit,
    callData,
    factory,
    factoryData,
    maxPriorityFeePerGas,
    maxFeePerGas,
    paymaster,
    paymasterData,
    paymasterPostOpGasLimit,
    paymasterVerificationGasLimit,
    sender,
    signature = '0x',
    verificationGasLimit,
  } = userOperation

  const accountGasLimits = concat([
    pad(numberToHex(verificationGasLimit || 0n), { size: 16 }),
    pad(numberToHex(callGasLimit || 0n), { size: 16 }),
  ])
  const initCode =
    factory && factoryData ? concat([factory, factoryData]) : '0x'
  const gasFees = concat([
    pad(numberToHex(maxPriorityFeePerGas || 0n), { size: 16 }),
    pad(numberToHex(maxFeePerGas || 0n), { size: 16 }),
  ])
  const nonce = userOperation.nonce ?? 0n
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
