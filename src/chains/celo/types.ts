import type { Address } from 'abitype'

import type { Block, BlockTag } from '../../types/block.js'
import type { Hex } from '../../types/misc.js'
import type {
  RpcBlock,
  RpcTransaction,
  RpcTransactionReceipt,
  RpcTransactionRequest,
} from '../../types/rpc.js'
import type {
  Transaction,
  TransactionReceipt,
  TransactionRequest,
} from '../../types/transaction.js'
import type { NeverBy } from '../../types/utils.js'
import type { OptimismRpcTransaction } from '../optimism/types.js'

type CeloBlockExclude =
  | 'difficulty'
  | 'gasLimit'
  | 'mixHash'
  | 'nonce'
  | 'uncles'

export type CeloBlockOverrides = {
  randomness: {
    committed: Hex
    revealed: Hex
  }
}
export type CeloBlock<
  TIncludeTransactions extends boolean = boolean,
  TBlockTag extends BlockTag = BlockTag,
> = NeverBy<
  Block<
    bigint,
    TIncludeTransactions,
    TBlockTag,
    CeloTransaction<TBlockTag extends 'pending' ? true : false>
  >,
  CeloBlockExclude
> &
  CeloBlockOverrides

export type CeloRpcBlockOverrides = {
  randomness: {
    committed: Hex
    revealed: Hex
  }
}
export type CeloRpcBlock<
  TBlockTag extends BlockTag = BlockTag,
  TIncludeTransactions extends boolean = boolean,
> = NeverBy<
  RpcBlock<
    TBlockTag,
    TIncludeTransactions,
    OptimismRpcTransaction<TBlockTag extends 'pending' ? true : false>
  >,
  CeloBlockExclude
> &
  CeloRpcBlockOverrides

export type CeloRpcTransactionOverrides = {
  feeCurrency: Address | null
  gatewayFee: Hex | null
  gatewayFeeRecipient: Address | null
}
export type CeloRpcTransaction<TPending extends boolean = boolean> =
  RpcTransaction<TPending> & CeloRpcTransactionOverrides

export type CeloRpcTransactionReceiptOverrides = {
  feeCurrency: Address | null
  gatewayFee: Hex | null
  gatewayFeeRecipient: Address | null
}
export type CeloRpcTransactionReceipt = RpcTransactionReceipt &
  CeloRpcTransactionReceiptOverrides

export type CeloRpcTransactionRequestOverrides = {
  feeCurrency?: Address
  gatewayFee?: Hex
  gatewayFeeRecipient?: Address
}
export type CeloRpcTransactionRequest = RpcTransactionRequest &
  CeloRpcTransactionRequestOverrides

export type CeloTransactionOverrides = {
  feeCurrency: Address | null
  gatewayFee: bigint | null
  gatewayFeeRecipient: Address | null
}
export type CeloTransaction<TPending extends boolean = boolean> =
  Transaction<TPending> & CeloTransactionOverrides

export type CeloTransactionReceiptOverrides = {
  feeCurrency: Address | null
  gatewayFee: bigint | null
  gatewayFeeRecipient: Address | null
}
export type CeloTransactionReceipt = TransactionReceipt &
  CeloTransactionReceiptOverrides

export type CeloTransactionRequestOverrides = {
  feeCurrency?: Address
  gatewayFee?: bigint
  gatewayFeeRecipient?: Address
}
export type CeloTransactionRequest = TransactionRequest &
  CeloTransactionRequestOverrides
