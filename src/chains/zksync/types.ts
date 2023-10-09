import type { Block, BlockTag } from '../../types/block.js'
import type { Hex } from '../../types/misc.js'
import type {
  RpcTransaction as RpcTransaction_,
  RpcTransactionRequest as RpcTransactionRequest_,
  RpcTransactionReceipt,
} from '../../types/rpc.js'
import type {
  Transaction as Transaction_,
  TransactionRequest as TransactionRequest_,
  TransactionReceipt,
} from '../../types/transaction.js'

// Types
// https://era.zksync.io/docs/api/js/types.html

/*type Log = {
    l1BatchNumber: number
}*/

type L2ToL1Log = {
    blockNumber: number;
    blockHash: string;
    l1BatchNumber: number;
    transactionIndex: number;
    shardId: number;
    isService: boolean;
    sender: string;
    key: string;
    value: string;
    transactionHash: string;
    logIndex: number
}

type Eip712Meta = {
  gasPerPubdata?: string
  customSignature?: Hex
  paymasterParams?: {
    paymaster?: Hex
    paymasterInput?: Hex
  }
  factoryDeps?: Hex[]
}

// Block 

// TODO: Do I need to exclude anything?

export type ZkSyncBlockOverrides = {
  l1BatchNumber: number
  l1BatchTimestamp: number
}

// Celo chain uses NeverBy while Optimism doesn't. Not sure yet about the logic.
export type ZkSyncBlock<
  TIncludeTransactions extends boolean = boolean,
  TBlockTag extends BlockTag = BlockTag,
> = Block<
    bigint,
    TIncludeTransactions,
    TBlockTag,
    ZkSyncTransaction<TBlockTag extends 'pending' ? true : false>
  > &
  ZkSyncBlockOverrides

//
// Transaction
//

type Transaction<TPending extends boolean = boolean> = Transaction_<
  bigint,
  number,
  TPending
> & {
    gasPerPubdata?: string
    customSignature: Hex
    // Should this be nested or in the root level?
    paymasterParams: {
      paymaster: Hex
      paymasterInput: Hex
    }
    factoryDeps?: Hex[]
}

export type ZkSyncTransaction<TPending extends boolean = boolean> = Transaction<TPending>

export type ZkSyncRpcTransaction = RpcTransactionRequest

//
// Transaction Request
//

export type TransactionRequest = TransactionRequest_ & {
  gasPerPubdata?: string
  customSignature: Hex
  paymasterParams: {
    paymaster: Hex
    paymasterInput: Hex
  }
  factoryDeps?: Hex[]
  // To ensure the server recognizes EIP-712 transactions, the transaction_type 
  // field is equal to 113. The number 712 cannot be used as it has to be one byte long.
  transaction_type: 113
}

export type RpcTransaction<TPending extends boolean = boolean> =
  RpcTransaction_<TPending> & {
    gasPerPubdata: string | null
    customSignature?: Hex | null
    paymasterParams?: {
      paymaster?: Hex | null
      paymasterInput?: Hex | null
    }
    factoryDeps?: Hex[] | null
  }

export type RpcTransactionRequest = RpcTransactionRequest_ & {
  // When sending to RPC we need to add into this field.
  customData?: Eip712Meta
}

//
// Transaction Receipt
//

// https://era.zksync.io/docs/api/js/types.html#transactionreceipt
export type ZkSyncRpcTransactionReceiptOverrides = {
    l1BatchNumber: Hex | null
    l1BatchTxIndex: Hex | null
    //logs: Log[],
    l1ToL1Logs: L2ToL1Log[]
}
export type ZkSyncRpcTransactionReceipt = RpcTransactionReceipt & ZkSyncRpcTransactionReceiptOverrides

// https://era.zksync.io/docs/api/js/types.html#transactionreceipt
export type ZkSyncTransactionReceiptOverrides = {
    
    // TODO: Add fields from providers.TransactionReceipt? Or are they in Transaction Receipt?
    l1BatchNumber: bigint | null
    l1BatchTxIndex: bigint | null
    // QUESTION: Weird, logs already exists in the receipt.
    // logs: Log[],
    l1ToL1Logs: L2ToL1Log[],
}
export type ZkSyncTransactionReceipt = TransactionReceipt &
ZkSyncTransactionReceiptOverrides