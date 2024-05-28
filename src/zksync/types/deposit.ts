import type { Address } from 'abitype'
import type { Hex } from '../../types/misc.js'
import type { GetDefaultBridgeAddressesReturnType } from '../actions/getDefaultBridgeAddresses.js'
import type { ZkSyncTransactionRequest } from './transaction.js'

export type DepositTransaction = {
  amount: bigint
  token?: Address
  to?: Address
  operatorTip?: bigint
  bridgeAddress?: Address
  approveERC20?: boolean
  approveBaseERC20?: boolean
  l2GasLimit?: bigint
  gasPerPubdataByte?: bigint
  refundRecipient?: Address
  overrides?: Overrides
  approveOverrides?: Overrides
  approveBaseOverrides?: Overrides
  customBridgeData?: Hex
}

export type DepositTransactionExtended = DepositTransaction & {
  bridgehubContractAddress: Address
  l2ChainId: bigint
  eRC20DefaultBridgeData: Hex
  bridgeAddresses?: GetDefaultBridgeAddressesReturnType
}

export interface Overrides
  extends Omit<ZkSyncTransactionRequest, 'to' | 'data'> {
  gasLimit: bigint
}

export type DepositTypeValues = {
  mintValue: bigint
  l2Value: bigint
  txValue: bigint
}

export type SecondBridgeEncodeData = {
  secondBridgeValue: bigint
  token: Address
  amount: bigint
  to: Address
}
