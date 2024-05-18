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
  type DeployContractErrorType,
  type DeployContractParameters,
  type DeployContractReturnType,
  deployContract,
} from './actions/deployContract.js'

export {
  type GetBaseTokenParameters,
  getBaseToken,
} from './actions/getBaseToken.js'

export {
  type GetErc20ContractValueParameters,
  getErc20ContractValue,
} from './actions/getErc20ContractValue.js'

export {
  type GetL2BridgeAddressParameters,
  getL2BridgeAddress,
} from './actions/getL2BridgeAddress.js'

export {
  type GetL2TransactionBaseCostParameters,
  getL2TransactionBaseCost,
} from './actions/getL2TransactionBaseCost.js'

export {
  type L2TransactionRequestDirectParameters,
  requestL2TransactionDirect,
} from './actions/requestL2TransactionDirect.js'

export {
  type L2TransactionRequestTwoBridgesParameters,
  requestL2TransactionTwoBridges,
} from './actions/requestL2TransactionTwoBridges.js'

export {
  type SharedBridgeParameters,
  sharedBridge,
} from './actions/sharedBridge.js'

export {
  type ApproveErc20L1Parameters,
  approveErc20L1,
} from './actions/approveErc20TokenL1.js'

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

export { serializeTransaction } from './serializers.js'

export {
  publicActionsL2,
  type PublicActionsL2,
} from './decorators/publicL2.js'

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
} from './types/transaction.js'

export {
  type Fee,
  type EstimateFeeParameters,
  estimateFee,
} from './actions/estimateFee.js'

export {
  type GetAllBalancesParameters,
  type GetAllBalancesReturnType,
  getAllBalances,
} from './actions/getAllBalances.js'

export {
  type GetBlockDetailsParameters,
  type BaseBlockDetails,
  getBlockDetails,
} from './actions/getBlockDetails.js'

export {
  type DefaultBridgeAddressesReturnType as BridgeContractsReturnType,
  getDefaultBridgeAddresses,
} from './actions/getDefaultBridgeAddresses.js'

export { getBridgehubContractAddress } from './actions/getBridgehubContractAddress.js'

export {
  type GetL1BatchBlockRangeParameters,
  type GetL1BatchBlockRangeReturnParameters,
  getL1BatchBlockRange,
} from './actions/getL1BatchBlockRange.js'

export {
  type GetL1BatchDetailsParameters,
  type BatchDetails,
  getL1BatchDetails,
} from './actions/getL1BatchDetails.js'

export { getL1BatchNumber } from './actions/getL1BatchNumber.js'

export { getL1ChainId } from './actions/getL1ChainId.js'

export {
  type MessageProof,
  type GetLogProofParameters,
  getLogProof,
} from './actions/getLogProof.js'

export { getMainContractAddress } from './actions/getMainContractAddress.js'

export {
  type GetRawBlockTransactionParameters,
  type RawBlockTransactions,
  getRawBlockTransactions,
} from './actions/getRawBlockTransaction.js'

export { getTestnetPaymasterAddress } from './actions/getTestnetPaymasterAddress.js'

export {
  type GetTransactionDetailsParameters,
  type TransactionDetails,
  getTransactionDetails,
} from './actions/getTransactionDetails.js'

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
