import { concat } from '../../../utils/data/concat.js'
import { pad } from '../../../utils/data/pad.js'
import { size } from '../../../utils/data/size.js'
import { numberToHex } from '../../../utils/index.js'
import type {
  PackedUserOperation,
  UserOperation,
} from '../../types/userOperation.js'
import { getInitCode } from './getInitCode.js'

/** Magic suffix for paymaster signature encoding (keccak256("PaymasterSignature")[:8]) */
const paymasterSignatureMagic = '0x22e325a297439656' as const

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

  // For v0.9, paymasterSignature can be provided separately and appended after paymasterData.
  // The encoding uses a magic suffix and length prefix as per ERC-4337 spec:
  // - forHash: just append the magic (signature is not part of hash)
  // - !forHash: append signature + length (2 bytes) + magic
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
        ...(paymasterSignature
          ? options.forHash
            ? [paymasterSignatureMagic]
            : [
                paymasterSignature as `0x${string}`,
                pad(numberToHex(size(paymasterSignature)), { size: 2 }),
                paymasterSignatureMagic,
              ]
          : []),
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
