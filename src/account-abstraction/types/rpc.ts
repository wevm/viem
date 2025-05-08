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

export type RpcEstimateUserOperationGasReturnType<
  entryPointVersion extends EntryPointVersion = EntryPointVersion,
> = EstimateUserOperationGasReturnType<entryPointVersion, Hex>

export type RpcGetUserOperationByHashReturnType<
  entryPointVersion extends EntryPointVersion = EntryPointVersion,
> = GetUserOperationByHashReturnType<entryPointVersion, Hex, Hex>

export type RpcUserOperation<
  entryPointVersion extends EntryPointVersion = EntryPointVersion,
> = UserOperation<entryPointVersion, Hex, Hex> & {
  eip7702Auth?: RpcAuthorization
}

export type RpcUserOperationReceipt<
  entryPointVersion extends EntryPointVersion = EntryPointVersion,
> = UserOperationReceipt<entryPointVersion, Hex, Hex, Hex>

export type RpcUserOperationRequest<
  entryPointVersion extends EntryPointVersion = EntryPointVersion,
> = UserOperationRequest<entryPointVersion, Hex, Hex>
