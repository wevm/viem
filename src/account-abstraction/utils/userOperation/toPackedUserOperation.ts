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
    authorization,
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

  const initCode = (() => {
    if (
      factory === '0x7702' ||
      factory === '0x7702000000000000000000000000000000000000'
    ) {
      if (!authorization) return '0x'
      const delegation = authorization.address
      if (factoryData) return concat([delegation, factoryData])
      return delegation
    }
    if (factory && factoryData) return concat([factory, factoryData])
    return '0x'
  })()

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
