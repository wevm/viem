import type { ErrorType } from '../../errors/utils.js'
import type { Hash } from '../../types/misc.js'
import {
  type EncodeAbiParametersErrorType,
  encodeAbiParameters,
} from '../../utils/abi/encodeAbiParameters.js'
import {
  type Keccak256ErrorType,
  keccak256,
} from '../../utils/hash/keccak256.js'

export type GetWithdrawalHashStorageSlotParameters = {
  withdrawalHash: Hash
}
export type GetWithdrawalHashStorageSlotReturnType = Hash
export type GetWithdrawalHashStorageSlotErrorType =
  | EncodeAbiParametersErrorType
  | Keccak256ErrorType
  | ErrorType

export function getWithdrawalHashStorageSlot({
  withdrawalHash,
}: GetWithdrawalHashStorageSlotParameters) {
  const data = encodeAbiParameters(
    [{ type: 'bytes32' }, { type: 'uint256' }],
    [withdrawalHash, 0n],
  )
  return keccak256(data)
}
