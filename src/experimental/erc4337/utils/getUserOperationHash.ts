import type { Address } from 'abitype'
import type { Hash } from '../../../types/misc.js'
import { encodeAbiParameters } from '../../../utils/abi/encodeAbiParameters.js'
import { concat } from '../../../utils/data/concat.js'
import { pad } from '../../../utils/data/pad.js'
import { numberToHex } from '../../../utils/encoding/toHex.js'
import { keccak256 } from '../../../utils/hash/keccak256.js'
import type {
  EntryPointVersion,
  GetEntryPointVersionParameter,
} from '../types/entryPointVersion.js'
import type { UserOperation } from '../types/userOperation.js'

export type GetUserOperationHashParameters<
  entryPointVersion extends EntryPointVersion = EntryPointVersion,
> = {
  chainId: number
  entryPointAddress: Address
  userOperation: UserOperation
} & GetEntryPointVersionParameter<undefined, entryPointVersion>

export type GetUserOperationHashReturnType = Hash

export function getUserOperationHash<
  const entryPointVersion extends EntryPointVersion,
>(
  parameters: GetUserOperationHashParameters<entryPointVersion>,
): GetUserOperationHashReturnType {
  const { chainId, entryPointAddress, userOperation } = parameters

  const { callData, nonce, preVerificationGas, sender } = userOperation

  const accountGasLimits = concat([
    pad(numberToHex(userOperation.verificationGasLimit), { size: 16 }),
    pad(numberToHex(userOperation.callGasLimit), { size: 16 }),
  ])
  const callData_hashed = keccak256(callData)
  const gasFees = concat([
    pad(numberToHex(userOperation.maxPriorityFeePerGas), { size: 16 }),
    pad(numberToHex(userOperation.maxFeePerGas), { size: 16 }),
  ])
  const initCode_hashed = keccak256(
    userOperation.factory && userOperation.factoryData
      ? concat([userOperation.factory, userOperation.factoryData])
      : '0x',
  )
  const paymasterAndData_hashed = keccak256(
    userOperation.paymaster
      ? concat([
          userOperation.paymaster,
          pad(numberToHex(userOperation.paymasterVerificationGasLimit || 0), {
            size: 16,
          }),
          pad(numberToHex(userOperation.paymasterPostOpGasLimit || 0), {
            size: 16,
          }),
          userOperation.paymasterData || '0x',
        ])
      : '0x',
  )

  const packedUserOp = encodeAbiParameters(
    [
      { type: 'address' },
      { type: 'uint256' },
      { type: 'bytes32' },
      { type: 'bytes32' },
      { type: 'bytes32' },
      { type: 'uint256' },
      { type: 'bytes32' },
      { type: 'bytes32' },
    ],
    [
      sender,
      nonce,
      initCode_hashed,
      callData_hashed,
      accountGasLimits,
      preVerificationGas,
      gasFees,
      paymasterAndData_hashed,
    ],
  )

  return keccak256(
    encodeAbiParameters(
      [{ type: 'bytes32' }, { type: 'address' }, { type: 'uint256' }],
      [keccak256(packedUserOp), entryPointAddress, BigInt(chainId)],
    ),
  )
}
