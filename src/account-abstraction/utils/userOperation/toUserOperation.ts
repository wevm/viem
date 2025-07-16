import { slice } from '../../../utils/data/slice.js'
import { hexToBigInt } from '../../../utils/encoding/fromHex.js'
import type {
  PackedUserOperation,
  UserOperation,
} from '../../types/userOperation.js'

/**
 * Converts a PackedUserOperation to UserOperation format by unpacking packed fields.
 *
 * This function is the reverse operation of `toPackedUserOperation`. It operates
 * field-by-field, using existing unpacked fields when available and only unpacking
 * packed fields when the unpacked versions don't exist.
 *
 * @param packedUserOperation - The user operation (with packed or unpacked fields)
 * @returns The unpacked UserOperation
 *
 * @example
 * ```ts
 * import { toUserOperation } from 'viem/account-abstraction'
 *
 * // Unpacks packed fields when individual fields don't exist
 * const packedUserOp = {
 *   sender: '0x...',
 *   accountGasLimits: '0x...', // will be unpacked to verificationGasLimit + callGasLimit
 *   gasFees: '0x...', // will be unpacked to maxPriorityFeePerGas + maxFeePerGas
 *   // ...
 * }
 *
 * // Uses existing unpacked fields when available
 * const mixedUserOp = {
 *   sender: '0x...',
 *   callGasLimit: 1000000n, // uses this instead of unpacking accountGasLimits
 *   gasFees: '0x...', // will unpack maxPriorityFeePerGas + maxFeePerGas since they don't exist
 *   // ...
 * }
 *
 * const result = toUserOperation(packedUserOp)
 * ```
 */
export function toUserOperation(
  packedUserOperation: PackedUserOperation | UserOperation,
): UserOperation {
  const userOp: Record<string, any> = { ...packedUserOperation }

  // Handle gas limits: use existing individual fields or unpack accountGasLimits
  if (
    !userOp.verificationGasLimit &&
    !userOp.callGasLimit &&
    userOp.accountGasLimits
  ) {
    userOp.verificationGasLimit = hexToBigInt(
      slice(userOp.accountGasLimits, 0, 16) as `0x${string}`,
    )
    userOp.callGasLimit = hexToBigInt(
      slice(userOp.accountGasLimits, 16, 32) as `0x${string}`,
    )
  }

  // Handle gas fees: use existing individual fields or unpack gasFees
  if (!userOp.maxPriorityFeePerGas && !userOp.maxFeePerGas && userOp.gasFees) {
    userOp.maxPriorityFeePerGas = hexToBigInt(
      slice(userOp.gasFees, 0, 16) as `0x${string}`,
    )
    userOp.maxFeePerGas = hexToBigInt(
      slice(userOp.gasFees, 16, 32) as `0x${string}`,
    )
  }

  // Handle initCode: use existing individual fields or unpack initCode (reverse of getInitCode)
  if (
    !userOp.factory &&
    !userOp.factoryData &&
    userOp.initCode &&
    userOp.initCode !== '0x'
  ) {
    const initCodeHex = userOp.initCode as `0x${string}`

    // Check for EIP-7702 authorization (exactly equals the prefix, meaning no authorization)
    const eip7702Prefix = '0x7702000000000000000000000000000000000000'
    if (initCodeHex === eip7702Prefix) {
      userOp.factory = eip7702Prefix as `0x${string}`
      // Remove packed initCode since we've unpacked it
      delete userOp.initCode
    } else {
      // Normal case or EIP-7702 with authorization (can't distinguish, so treat as normal)
      // factory (20 bytes) + factoryData (rest)
      userOp.factory = slice(initCodeHex, 0, 20)
      const factoryDataSlice = slice(initCodeHex, 20)
      if (factoryDataSlice.length > 2) {
        userOp.factoryData = factoryDataSlice
      }
      // Remove packed initCode since we've unpacked it
      delete userOp.initCode
    }
  }

  // Handle paymaster: use existing individual fields or unpack paymasterAndData
  if (
    !userOp.paymaster &&
    !userOp.paymasterVerificationGasLimit &&
    !userOp.paymasterPostOpGasLimit &&
    !userOp.paymasterData
  ) {
    // Only unpack paymasterAndData if this appears to be packed format (has packed fields)
    const hasPackedFields = userOp.accountGasLimits || userOp.gasFees
    if (
      userOp.paymasterAndData &&
      userOp.paymasterAndData !== '0x' &&
      hasPackedFields &&
      userOp.paymasterAndData.length >= 106
    ) {
      // 2 + 20*2 + 16*2 + 16*2 = 106 chars minimum for packed format
      // paymaster (20 bytes) + paymasterVerificationGasLimit (16 bytes) + paymasterPostOpGasLimit (16 bytes) + paymasterData (rest)
      userOp.paymaster = slice(userOp.paymasterAndData, 0, 20) as `0x${string}`
      userOp.paymasterVerificationGasLimit = hexToBigInt(
        slice(userOp.paymasterAndData, 20, 36) as `0x${string}`,
      )
      userOp.paymasterPostOpGasLimit = hexToBigInt(
        slice(userOp.paymasterAndData, 36, 52) as `0x${string}`,
      )
      const paymasterDataSlice = slice(
        userOp.paymasterAndData,
        52,
      ) as `0x${string}`
      if (paymasterDataSlice.length > 2) {
        userOp.paymasterData = paymasterDataSlice
      }
      // Remove packed paymasterAndData since we've unpacked it
      delete userOp.paymasterAndData
    }
  }

  // Remove packed fields to ensure clean unpacked format
  delete userOp.accountGasLimits
  delete userOp.gasFees

  return userOp as UserOperation
}
