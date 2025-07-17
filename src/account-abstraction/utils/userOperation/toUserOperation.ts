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
 * @param userOperation - The user operation (with packed or unpacked fields). {@link PackedUserOperation} | {@link UserOperation}
 * @returns The unpacked User Operation. {@link UserOperation}
 *
 * @example
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
 */
export function toUserOperation(
  userOperation: PackedUserOperation | UserOperation,
): UserOperation {
  const { accountGasLimits, gasFees, ...restUserOperation } =
    userOperation as PackedUserOperation
  const result = { ...restUserOperation } as unknown as UserOperation

  // Check if this appears to be packed format (has packed fields)
  // These are the only fields that are known to be packed fields
  // initCode and paymasterAndData could be from EntryPoint v0.6
  // See UserOperation type for more details
  const hasPackedFields =
    'accountGasLimits' in userOperation || 'gasFees' in userOperation

  // Handle gas limits: use existing individual fields or unpack accountGasLimits
  if (
    !('verificationGasLimit' in userOperation) &&
    !('callGasLimit' in userOperation) &&
    'accountGasLimits' in userOperation
  ) {
    result.verificationGasLimit = hexToBigInt(
      slice(userOperation.accountGasLimits, 0, 16),
    )
    result.callGasLimit = hexToBigInt(
      slice(userOperation.accountGasLimits, 16, 32),
    )
  }

  // Handle gas fees: use existing individual fields or unpack gasFees
  if (
    !('maxPriorityFeePerGas' in userOperation) &&
    !('maxFeePerGas' in userOperation) &&
    'gasFees' in userOperation
  ) {
    result.maxPriorityFeePerGas = hexToBigInt(
      slice(userOperation.gasFees, 0, 16),
    )
    result.maxFeePerGas = hexToBigInt(slice(userOperation.gasFees, 16, 32))
  }

  // Handle initCode: use existing individual fields or unpack initCode (reverse of getInitCode)
  if (
    !('factory' in userOperation) &&
    !('factoryData' in userOperation) &&
    // Only unpack initCode if this appears to be packed format (has packed fields)
    hasPackedFields &&
    userOperation.initCode &&
    userOperation.initCode !== '0x'
  ) {
    // Check for EIP-7702 authorization (exactly equals the prefix, meaning no authorization)
    const eip7702Prefix = '0x7702000000000000000000000000000000000000'
    if (userOperation.initCode === eip7702Prefix) {
      result.factory = eip7702Prefix
    } else {
      // Normal case or EIP-7702 with authorization (can't distinguish, so treat as normal)
      // factory (20 bytes) + factoryData (rest)
      result.factory = slice(userOperation.initCode, 0, 20)
      const factoryDataSlice = slice(userOperation.initCode, 20)
      if (factoryDataSlice.length > 2) {
        result.factoryData = factoryDataSlice
      }
    }
    // Remove packed initCode since we've unpacked it
    delete result.initCode
  }

  // Handle paymaster: use existing individual fields or unpack paymasterAndData
  if (
    !('paymaster' in userOperation) &&
    !('paymasterVerificationGasLimit' in userOperation) &&
    !('paymasterPostOpGasLimit' in userOperation) &&
    !('paymasterData' in userOperation) &&
    // Only unpack paymasterAndData if this appears to be packed format (has packed fields)
    hasPackedFields &&
    userOperation.paymasterAndData &&
    userOperation.paymasterAndData !== '0x' &&
    userOperation.paymasterAndData.length >= 106
  ) {
    // 2 + 20*2 + 16*2 + 16*2 = 106 chars minimum for packed format
    // paymaster (20 bytes) + paymasterVerificationGasLimit (16 bytes) + paymasterPostOpGasLimit (16 bytes) + paymasterData (rest)
    result.paymaster = slice(userOperation.paymasterAndData, 0, 20)
    result.paymasterVerificationGasLimit = hexToBigInt(
      slice(userOperation.paymasterAndData, 20, 36),
    )
    result.paymasterPostOpGasLimit = hexToBigInt(
      slice(userOperation.paymasterAndData, 36, 52),
    )
    const paymasterDataSlice = slice(userOperation.paymasterAndData, 52)
    if (paymasterDataSlice.length > 2) {
      result.paymasterData = paymasterDataSlice
    }
    // Remove packed paymasterAndData since we've unpacked it
    delete result.paymasterAndData
  }

  return result
}
