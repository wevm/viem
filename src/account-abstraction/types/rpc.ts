import type { Address } from 'abitype'
import type { Hex } from '../../types/misc.js'
import type { RpcAuthorization } from '../../types/rpc.js'
import type { EntryPointVersion } from './entryPointVersion.js'
import type {
  EstimateUserOperationGasReturnType,
  GetUserOperationByHashReturnType,
  UserOperation,
  UserOperationReceipt,
  UserOperationRequest,
} from './userOperation.js'

export type RpcEip7702Auth = {
  chainId: number
  nonce: number
  address: Address
  r?: Hex
  s?: Hex
  yParity?: number
}

export type RpcEstimateUserOperationGasReturnType<
  entryPointVersion extends EntryPointVersion = EntryPointVersion,
> = EstimateUserOperationGasReturnType<entryPointVersion, Hex>

export type RpcGetUserOperationByHashReturnType<
  entryPointVersion extends EntryPointVersion = EntryPointVersion,
> = GetUserOperationByHashReturnType<entryPointVersion, Hex>

export type RpcUserOperation<
  entryPointVersion extends EntryPointVersion = EntryPointVersion,
> = UserOperation<entryPointVersion, Hex> & {
  eip7702Auth?: RpcAuthorization
}

export type RpcUserOperationReceipt<
  entryPointVersion extends EntryPointVersion = EntryPointVersion,
> = UserOperationReceipt<entryPointVersion, Hex, Hex, Hex>

export type RpcUserOperationRequest<
  entryPointVersion extends EntryPointVersion = EntryPointVersion,
> = UserOperationRequest<entryPointVersion, Hex> & {
  eip7702Auth?: RpcAuthorization
}
