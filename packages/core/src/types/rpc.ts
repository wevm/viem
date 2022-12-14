import type { Block, BlockIdentifier, BlockNumber, Uncle } from './block'
import type { FeeHistory, FeeValues } from './fee'
import type { Log } from './log'
import type {
  TransactionEIP1559,
  TransactionEIP2930,
  TransactionLegacy,
  TransactionReceipt,
  TransactionRequest,
} from './transaction'

export type Index = `0x${string}`
export type Quantity = `0x${string}`

export type RpcBlock = Block<Quantity, RpcTransaction>
export type RpcBlockNumber = BlockNumber<Quantity>
export type RpcBlockIdentifier = BlockIdentifier<Quantity>
export type RpcUncle = Uncle<Quantity, Index>
export type RpcFeeHistory = FeeHistory<Quantity>
export type RpcFeeValues = FeeValues<Quantity>
export type RpcLog = Log<Quantity, Index>
export type RpcTransactionReceipt = TransactionReceipt<Quantity, Index>
export type RpcTransactionRequest = TransactionRequest<Quantity, Index>
export type RpcTransaction =
  | TransactionLegacy<Quantity, Index, '0x0'>
  | TransactionEIP2930<Quantity, Index, '0x1'>
  | TransactionEIP1559<Quantity, Index, '0x2'>
