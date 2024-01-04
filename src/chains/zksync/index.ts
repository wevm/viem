export { chainConfig } from './chainConfig.js'

export { serializeTransaction } from './serializers.js'

export type {
  ZkSyncBlock,
  ZkSyncBlockOverrides,
  ZkSyncEip712Meta,
  ZkSyncFeeValues,
  ZkSyncL2ToL1Log,
  ZkSyncLog,
  ZkSyncRpcBlock,
  ZkSyncRpcBlockOverrides,
  ZkSyncRpcL2ToL1Log,
  ZkSyncRpcLog,
  ZkSyncRpcTransaction,
  ZkSyncRpcTransactionEIP712,
  ZkSyncRpcTransactionPriority,
  ZkSyncRpcTransactionReceiptOverrides,
  ZkSyncRpcTransactionRequest,
  ZkSyncRpcTransactionRequestEIP712,
  ZkSyncTransaction,
  ZkSyncTransactionEIP712,
  ZkSyncTransactionReceipt,
  ZkSyncTransactionReceiptOverrides,
  ZkSyncTransactionRequest,
  ZkSyncTransactionRequestEIP712,
  ZkSyncTransactionSerializable,
  ZkSyncTransactionSerializableEIP712,
  ZkSyncTransactionSerialized,
  ZkSyncTransactionSerializedEIP712,
  ZkSyncTransactionType,
} from './types.js'

export { prepareTransactionRequest } from './actions/prepareTransactionRequest.js'
export { sendTransaction } from './actions/sendTransaction.js'

export {
  zkSync,
  zkSyncTestnet,
  zkSyncSepoliaTestnet,
} from './chains.js'

export { eip712Actions, type Eip712Actions } from './decorators/eip712.js'
