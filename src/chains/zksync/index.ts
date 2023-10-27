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
export {
  sendTransaction as sendEip712Transaction,
  type SendTransactionParameters as SendEip712TransactionParameters,
  type SendTransactionErrorType as SendEip712TransactionErrorType,
  type SendTransactionReturnType as SendEip712TransactionReturnType,
} from './actions/sendTransaction.js'

export {
  signEip712Transaction,
  type SignEip712TransactionParameters,
  type SignEip712TransactionReturnType,
  type SignEip712TransactionErrorType,
} from './actions/signTransaction.js'

export {
  writeContract as writeEip712Contract,
  type WriteContractParameters as WriteEip712ContractParameters,
  type WriteContractErrorType as WriteEip712ContractErrorType,
  type WriteContractReturnType as WriteEip712ContractReturnType,
} from './actions/writeContract.js'

export {
  prepareTransactionRequest as prepareEip712TransactionRequest,
  type PrepareTransactionRequestParameters as PrepareEip712TransactionRequestParameters,
  type PrepareTransactionRequestErrorType as PrepareEip712TransactionRequestErrorType,
  type PrepareTransactionRequestReturnType as PrepareEip712TransactionRequestReturnType,
} from './actions/prepareTransactionRequest.js'

export {
  zkSync,
  zkSyncTestnet,
} from './chains.js'

export { eip712Actions, type Eip712Actions } from './decorators/eip712.js'
