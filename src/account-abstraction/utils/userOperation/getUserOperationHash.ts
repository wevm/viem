import type { Address } from 'abitype'
import type { Hash } from '../../../types/misc.js'
import { encodeAbiParameters } from '../../../utils/abi/encodeAbiParameters.js'
import { concat } from '../../../utils/data/concat.js'
import { pad } from '../../../utils/data/pad.js'
import { numberToHex } from '../../../utils/encoding/toHex.js'
import { keccak256 } from '../../../utils/hash/keccak256.js'
import { encodePacked, hashTypedData } from '../../../utils/index.js'
import type { EntryPointVersion } from '../../types/entryPointVersion.js'
import type { UserOperation } from '../../types/userOperation.js'

export type GetUserOperationHashParameters<
  entryPointVersion extends EntryPointVersion = EntryPointVersion,
> = {
  chainId: number
  entryPointAddress: Address
  entryPointVersion: entryPointVersion | EntryPointVersion
  userOperation: UserOperation<entryPointVersion>
}

export type GetUserOperationHashReturnType = Hash

export function getUserOperationHash<
  entryPointVersion extends EntryPointVersion,
>(
  parameters: GetUserOperationHashParameters<entryPointVersion>,
): GetUserOperationHashReturnType {
  const { chainId, entryPointAddress, entryPointVersion } = parameters
  const userOperation = parameters.userOperation as UserOperation
  const {
    callData,
    callGasLimit,
    initCode,
    maxFeePerGas,
    maxPriorityFeePerGas,
    nonce,
    paymasterAndData,
    preVerificationGas,
    sender,
    verificationGasLimit,
  } = userOperation

  const packedUserOp = (() => {
    if (entryPointVersion === '0.6') {
      return encodeAbiParameters(
        [
          { type: 'address' },
          { type: 'uint256' },
          { type: 'bytes32' },
          { type: 'bytes32' },
          { type: 'uint256' },
          { type: 'uint256' },
          { type: 'uint256' },
          { type: 'uint256' },
          { type: 'uint256' },
          { type: 'bytes32' },
        ],
        [
          sender,
          nonce,
          keccak256(initCode ?? '0x'),
          keccak256(callData ?? '0x'),
          callGasLimit,
          verificationGasLimit,
          preVerificationGas,
          maxFeePerGas,
          maxPriorityFeePerGas,
          keccak256(paymasterAndData ?? '0x'),
        ],
      )
    }

    if (entryPointVersion === '0.7') {
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
              pad(
                numberToHex(userOperation.paymasterVerificationGasLimit || 0),
                {
                  size: 16,
                },
              ),
              pad(numberToHex(userOperation.paymasterPostOpGasLimit || 0), {
                size: 16,
              }),
              userOperation.paymasterData || '0x',
            ])
          : '0x',
      )

      return encodeAbiParameters(
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
    }

    if (entryPointVersion === '0.8') {
      const isEip7702 =
        userOperation.factory &&
        userOperation.factory === '0x7702' &&
        userOperation.authorization

      const delegation = isEip7702
        ? userOperation.authorization?.address
        : undefined

      const initCode = delegation
        ? userOperation.factoryData
          ? encodePacked(
              ['address', 'bytes'],
              [delegation, userOperation.factoryData],
            )
          : encodePacked(['address'], [delegation])
        : userOperation.factory && userOperation.factoryData
          ? concat([userOperation.factory, userOperation.factoryData])
          : '0x'

      const accountGasLimits = concat([
        pad(numberToHex(verificationGasLimit), { size: 16 }),
        pad(numberToHex(callGasLimit), { size: 16 }),
      ])

      const gasFees = concat([
        pad(numberToHex(maxPriorityFeePerGas), { size: 16 }),
        pad(numberToHex(maxFeePerGas), { size: 16 }),
      ])

      const paymasterAndData = userOperation.paymaster
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
        : '0x'

      return hashTypedData({
        types: {
          PackedUserOperation: [
            { type: 'address', name: 'sender' },
            { type: 'uint256', name: 'nonce' },
            { type: 'bytes', name: 'initCode' },
            { type: 'bytes', name: 'callData' },
            { type: 'bytes32', name: 'accountGasLimits' },
            { type: 'uint256', name: 'preVerificationGas' },
            { type: 'bytes32', name: 'gasFees' },
            { type: 'bytes', name: 'paymasterAndData' },
          ],
        },
        primaryType: 'PackedUserOperation',
        domain: {
          name: 'ERC4337',
          version: '1',
          chainId,
          verifyingContract: entryPointAddress,
        },
        message: {
          sender,
          nonce,
          initCode,
          callData: callData,
          accountGasLimits,
          preVerificationGas: preVerificationGas,
          gasFees,
          paymasterAndData,
        },
      })
    }
    throw new Error(`entryPointVersion "${entryPointVersion}" not supported.`)
  })()

  if (entryPointVersion === '0.8') {
    return packedUserOp
  }

  return keccak256(
    encodeAbiParameters(
      [{ type: 'bytes32' }, { type: 'address' }, { type: 'uint256' }],
      [keccak256(packedUserOp), entryPointAddress, BigInt(chainId)],
    ),
  )
}
