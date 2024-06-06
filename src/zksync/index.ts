// biome-ignore lint/performance/noBarrelFile: entrypoint module
export {
  type DeployContractErrorType,
  type DeployContractParameters,
  type DeployContractReturnType,
  deployContract,
} from './actions/deployContract.js'
export {
  type EstimateFeeParameters,
  type EstimateFeeReturnType,
  estimateFee,
} from './actions/estimateFee.js'
export {
  type GetAllBalancesParameters,
  type GetAllBalancesReturnType,
  getAllBalances,
} from './actions/getAllBalances.js'
export {
  type GetBlockDetailsParameters,
  type GetBlockDetailsReturnType,
  getBlockDetails,
} from './actions/getBlockDetails.js'
export {
  type GetDefaultBridgeAddressesReturnType,
  getDefaultBridgeAddresses,
} from './actions/getDefaultBridgeAddresses.js'
export { getBridgehubContractAddress } from './actions/getBridgehubContractAddress.js'
export {
  type GetL1AllowanceErrorType,
  type GetL1AllowanceParameters,
  type GetL1AllowanceReturnType,
  getL1Allowance,
} from './actions/getL1Allowance.js'
export {
  type GetL1BalanceErrorType,
  type GetL1BalanceParameters,
  type GetL1BalanceReturnType,
  getL1Balance,
} from './actions/getL1Balance.js'
export {
  type GetL1BatchBlockRangeParameters,
  type GetL1BatchBlockRangeReturnParameters,
  getL1BatchBlockRange,
} from './actions/getL1BatchBlockRange.js'
export {
  type GetL1BatchDetailsParameters,
  type GetL1BatchDetailsReturnType,
  getL1BatchDetails,
} from './actions/getL1BatchDetails.js'
export { getL1BatchNumber } from './actions/getL1BatchNumber.js'
export { getL1ChainId } from './actions/getL1ChainId.js'
export {
  type GetL1TokenBalanceErrorType,
  type GetL1TokenBalanceParameters,
  type GetL1TokenBalanceReturnType,
  getL1TokenBalance,
} from './actions/getL1TokenBalance.js'
export {
  type GetLogProofReturnType,
  type GetLogProofParameters,
  getLogProof,
} from './actions/getLogProof.js'
export { getMainContractAddress } from './actions/getMainContractAddress.js'
export {
  type GetRawBlockTransactionsParameters,
  type GetRawBlockTransactionsReturnType,
  getRawBlockTransactions,
} from './actions/getRawBlockTransactions.js'
export { getTestnetPaymasterAddress } from './actions/getTestnetPaymasterAddress.js'
export {
  type GetTransactionDetailsParameters,
  type GetTransactionDetailsReturnType,
  getTransactionDetails,
} from './actions/getTransactionDetails.js'
export {
  type SendTransactionErrorType,
  type SendTransactionParameters,
  type SendTransactionReturnType,
  sendTransaction,
} from './actions/sendTransaction.js'
export {
  type SendEip712TransactionErrorType,
  type SendEip712TransactionParameters,
  type SendEip712TransactionReturnType,
  sendEip712Transaction,
} from './actions/sendEip712Transaction.js'
export {
  type SignEip712TransactionErrorType,
  type SignEip712TransactionParameters,
  type SignEip712TransactionReturnType,
  signEip712Transaction,
} from './actions/signEip712Transaction.js'
export {
  type SignTransactionErrorType,
  type SignTransactionParameters,
  type SignTransactionReturnType,
  signTransaction,
} from './actions/signTransaction.js'

export {
  zkSync,
  zkSyncTestnet,
  zkSyncSepoliaTestnet,
} from './chains.js'

export { chainConfig } from './chainConfig.js'

export {
  eip712WalletActions,
  type Eip712WalletActions,
} from './decorators/eip712.js'

export {
  publicActionsL1,
  type PublicActionsL1,
} from './decorators/publicL1.js'

export {
  publicActionsL2,
  type PublicActionsL2,
} from './decorators/publicL2.js'

export { serializeTransaction } from './serializers.js'

export type {
  ZkSyncBlock,
  ZkSyncBlockOverrides,
  ZkSyncRpcBlock,
  ZkSyncRpcBlockOverrides,
} from './types/block.js'
export type { ChainEIP712 } from './types/chain.js'
export type {
  EIP712Domain,
  EIP712DomainFn,
  ZkSyncEip712Meta,
} from './types/eip712.js'
export type {
  CommonDataRawBlockTransaction,
  RawBlockTransactions,
  PublicZkSyncRpcSchema,
} from './types/eip1193.js'
export type { ZkSyncFeeValues } from './types/fee.js'
export type {
  ZkSyncL2ToL1Log,
  ZkSyncLog,
  ZkSyncRpcL2ToL1Log,
  ZkSyncRpcLog,
} from './types/log.js'
export type {
  TransactionRequestEIP712,
  ZkSyncEIP712TransactionSignable,
  ZkSyncRawBlockTransactions,
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
  ZkSyncTransactionDetails,
} from './types/transaction.js'

export {
  type GetApprovalBasedPaymasterInputParameters,
  type GetApprovalBasedPaymasterInputReturnType,
  getApprovalBasedPaymasterInput,
} from './utils/paymaster/getApprovalBasedPaymasterInput.js'
export {
  type GetGeneralPaymasterInputParameters,
  type GetGeneralPaymasterInputReturnType,
  getGeneralPaymasterInput,
} from './utils/paymaster/getGeneralPaymasterInput.js'
