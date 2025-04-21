import type { Address } from 'abitype'

import type { TypedDataDefinition } from '../../../types/typedData.js'
import { concat } from '../../../utils/data/concat.js'
import type { UserOperation } from '../../types/userOperation.js'
import { toPackedUserOperation } from './toPackedUserOperation.js'

export type GetUserOperationTypedDataParameters = {
  chainId: number
  entryPointAddress: Address
  userOperation: UserOperation<'0.8'>
}

export function getUserOperationTypedData(
  parameters: GetUserOperationTypedDataParameters,
) {
  const { chainId, entryPointAddress, userOperation } = parameters

  const packedUserOp = toPackedUserOperation(userOperation)

  const initCode_ = (() => {
    if (
      userOperation.authorization &&
      (userOperation.factory === '0x7702' ||
        userOperation.factory === '0x7702000000000000000000000000000000000000')
    ) {
      const delegation = userOperation.authorization.address
      if (userOperation.factoryData)
        return concat([delegation, userOperation.factoryData])
      return delegation
    }
    return concat([
      userOperation.factory ?? '0x',
      userOperation.factoryData ?? '0x',
    ])
  })()

  return {
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
      ...packedUserOp,
      initCode: initCode_,
    },
  } as const satisfies TypedDataDefinition
}
