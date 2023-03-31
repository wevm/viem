import type { Block, BlockIdentifier, BlockNumber, Uncle } from './block.js'
import type { FeeHistory, FeeValues } from './fee.js'
import type { Log } from './log.js'
import type {
  TransactionEIP1559,
  TransactionEIP2930,
  TransactionLegacy,
  TransactionReceipt,
  TransactionRequest,
} from './transaction.js'

export type Index = `0x${string}`
export type Quantity = `0x${string}`
export type Status = '0x0' | '0x1'
export type TransactionType = '0x0' | '0x1' | '0x2'

export type RpcBlock = Block<Quantity, RpcTransaction>
export type RpcBlockNumber = BlockNumber<Quantity>
export type RpcBlockIdentifier = BlockIdentifier<Quantity>
export type RpcUncle = Uncle<Quantity>
export type RpcFeeHistory = FeeHistory<Quantity>
export type RpcFeeValues = FeeValues<Quantity>
export type RpcLog = Log<Quantity, Index>
export type RpcTransactionReceipt = TransactionReceipt<
  Quantity,
  Index,
  Status,
  TransactionType
>
export type RpcTransactionRequest = TransactionRequest<Quantity, Index>
export type RpcTransaction =
  | TransactionLegacy<Quantity, Index, '0x0'>
  | TransactionEIP2930<Quantity, Index, '0x1'>
  | TransactionEIP1559<Quantity, Index, '0x2'>
