// biome-ignore lint/performance/noBarrelFile: entrypoint module
export {
  type ToSmartAccountErrorType,
  type ToSmartAccountParameters,
  toSmartAccount,
} from './accounts/toSmartAccount.js'
export {
  type ToMultisigSmartAccountParameters,
  toMultisigSmartAccount,
} from './accounts/toMultisigSmartAccount.js'
export {
  type ToSinglesigSmartAccountParameters,
  toSinglesigSmartAccount,
} from './accounts/toSinglesigSmartAccount.js'

export {
  type DeployContractErrorType,
  type DeployContractParameters,
  type DeployContractReturnType,
  deployContract,
} from './actions/deployContract.js'
export {
  type EncodeDeployDataParameters,
  type EncodeDeployDataErrorType,
  encodeDeployData,
} from './utils/abi/encodeDeployData.js'
export {
  type HashBytecodeErrorType,
  hashBytecode,
} from './utils/hashBytecode.js'
export {
  type DepositErrorType,
  type DepositReturnType,
  type DepositParameters,
  deposit,
} from './actions/deposit.js'
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
  type IsWithdrawalFinalizedErrorType,
  type IsWithdrawalFinalizedReturnType,
  type IsWithdrawalFinalizedParameters,
  isWithdrawalFinalized,
} from './actions/isWithdrawalFinalized.js'
export {
  type RequestExecuteErrorType,
  type RequestExecuteReturnType,
  type RequestExecuteParameters,
  requestExecute,
} from './actions/requestExecute.js'
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
  type GetL2TokenAddressReturnType,
  type GetL2TokenAddressParameters,
  getL2TokenAddress,
} from './actions/getL2TokenAddress.js'
export {
  type GetL1TokenAddressReturnType,
  type GetL1TokenAddressParameters,
  getL1TokenAddress,
} from './actions/getL1TokenAddress.js'
export {
  type WithdrawErrorType,
  type WithdrawParameters,
  type WithdrawReturnType,
  withdraw,
} from './actions/withdraw.js'
export {
  type FinalizeWithdrawalErrorType,
  type FinalizeWithdrawalParameters,
  type FinalizeWithdrawalReturnType,
  finalizeWithdrawal,
} from './actions/finalizeWithdrawal.js'

export {
  legacyEthAddress,
  l2BaseTokenAddress,
} from './constants/address.js'

export {
  /** @deprecated Use `zksync` instead */
  zksync as zkSync,
  zksync,
  /** @deprecated Use `zksync` instead */
  zksyncInMemoryNode as zkSyncInMemoryNode,
  zksyncLocalCustomHyperchain,
  zksyncLocalHyperchain,
  zksyncLocalHyperchainL1,
  zksyncInMemoryNode,
  /** @deprecated Use `zksync` instead */
  zksyncLocalNode as zkSyncLocalNode,
  zksyncLocalNode,
  /** @deprecated Use `zksync` instead */
  zksyncSepoliaTestnet as zkSyncSepoliaTestnet,
  zksyncSepoliaTestnet,
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

export {
  walletActionsL1,
  type WalletActionsL1,
} from './decorators/walletL1.js'

export {
  walletActionsL2,
  type WalletActionsL2,
} from './decorators/walletL2.js'

export { serializeTransaction } from './serializers.js'

export type { ZksyncSmartAccount } from './types/account.js'
export type {
  /** @deprecated Use `ZksyncBlock` instead */
  ZksyncBlock as ZkSyncBlock,
  ZksyncBlock,
  /** @deprecated Use `ZksyncRpcBlock` instead */
  ZksyncRpcBlock as ZkSyncRpcBlock,
  ZksyncRpcBlock,
  ZksyncBatchDetails,
  ZksyncBlockDetails,
  ZksyncNumberParameter,
} from './types/block.js'
export type { ChainEIP712 } from './types/chain.js'
export type {
  EIP712Domain,
  EIP712DomainFn,
  /** @deprecated Use `ZksyncEip712Meta` instead */
  ZksyncEip712Meta as ZkSyncEip712Meta,
  ZksyncEip712Meta,
} from './types/eip712.js'
export type {
  CommonDataRawBlockTransaction,
  RawBlockTransactions,
  PublicZksyncRpcSchema,
  /** @deprecated Use `PublicZksyncRpcSchema` instead */
  PublicZksyncRpcSchema as PublicZkSyncRpcSchema,
} from './types/eip1193.js'
export type {
  /** @deprecated Use `ZksyncFeeValues` instead */
  ZksyncFeeValues as ZkSyncFeeValues,
  ZksyncFeeValues,
} from './types/fee.js'
export type {
  /** @deprecated Use `ZksyncL2ToL1Log` instead */
  ZksyncL2ToL1Log as ZkSyncL2ToL1Log,
  ZksyncL2ToL1Log,
  /** @deprecated Use `ZksyncLog` instead */
  ZksyncLog as ZkSyncLog,
  ZksyncLog,
  /** @deprecated Use `ZksyncRpcL2ToL1Log` instead */
  ZksyncRpcL2ToL1Log as ZkSyncRpcL2ToL1Log,
  ZksyncRpcL2ToL1Log,
  /** @deprecated Use `ZkSyncRpcLog` instead */
  ZksyncRpcLog as ZkSyncRpcLog,
  ZksyncRpcLog,
} from './types/log.js'

export type {
  TransactionRequestEIP712,
  /** @deprecated Use `ZksyncTransactionRequest_internal` instead */
  TransactionRequest as ZkSyncTransactionRequest_internal,
  TransactionRequest as ZksyncTransactionRequest_internal,
  /** @deprecated Use `ZksyncEIP712TransactionSignable` instead */
  ZksyncEIP712TransactionSignable as ZkSyncEIP712TransactionSignable,
  ZksyncEIP712TransactionSignable,
  /** @deprecated Use `ZksyncRpcTransaction` instead */
  ZksyncRpcTransaction as ZkSyncRpcTransaction,
  ZksyncRpcTransaction,
  /** @deprecated Use `ZksyncRpcTransactionEIP712` instead */
  ZksyncRpcTransactionEIP712 as ZkSyncRpcTransactionEIP712,
  ZksyncRpcTransactionEIP712,
  /** @deprecated Use `ZksyncRpcTransactionPriority` instead */
  ZksyncRpcTransactionPriority as ZkSyncRpcTransactionPriority,
  ZksyncRpcTransactionPriority,
  /** @deprecated Use `ZksyncRpcTransactionReceiptOverrides` instead */
  ZksyncRpcTransactionReceiptOverrides as ZkSyncRpcTransactionReceiptOverrides,
  ZksyncRpcTransactionReceiptOverrides,
  /** @deprecated Use `ZksyncRpcTransactionRequest` instead */
  ZksyncRpcTransactionRequest as ZkSyncRpcTransactionRequest,
  ZksyncRpcTransactionRequest,
  /** @deprecated Use `ZksyncRpcTransactionRequestEIP712` instead */
  ZksyncRpcTransactionRequestEIP712 as ZkSyncRpcTransactionRequestEIP712,
  ZksyncRpcTransactionRequestEIP712,
  /** @deprecated Use `ZksyncTransaction` instead */
  ZksyncTransaction as ZkSyncTransaction,
  ZksyncTransaction,
  /** @deprecated Use `ZksyncTransactionEIP712` instead */
  ZksyncTransactionEIP712 as ZkSyncTransactionEIP712,
  ZksyncTransactionEIP712,
  /** @deprecated Use `ZksyncTransactionReceipt` instead */
  ZksyncTransactionReceipt as ZkSyncTransactionReceipt,
  ZksyncTransactionReceipt,
  /** @deprecated Use `ZksyncTransactionReceiptOverrides` instead */
  ZksyncTransactionReceiptOverrides as ZkSyncTransactionReceiptOverrides,
  ZksyncTransactionReceiptOverrides,
  /** @deprecated Use `ZksyncTransactionRequest` instead */
  ZksyncTransactionRequest as ZkSyncTransactionRequest,
  ZksyncTransactionRequest,
  /** @deprecated Use `ZksyncTransactionRequestEIP712` instead */
  ZksyncTransactionRequestEIP712 as ZkSyncTransactionRequestEIP712,
  ZksyncTransactionRequestEIP712,
  /** @deprecated Use `ZksyncTransactionSerializable` instead */
  ZksyncTransactionSerializable as ZkSyncTransactionSerializable,
  ZksyncTransactionSerializable,
  /** @deprecated Use `ZksyncTransactionSerializableEIP712` instead */
  ZksyncTransactionSerializableEIP712 as ZkSyncTransactionSerializableEIP712,
  ZksyncTransactionSerializableEIP712,
  /** @deprecated Use `ZksyncTransactionSerialized` instead */
  ZksyncTransactionSerialized as ZkSyncTransactionSerialized,
  ZksyncTransactionSerialized,
  /** @deprecated Use `ZksyncTransactionSerializedEIP712` instead */
  ZksyncTransactionSerializedEIP712 as ZkSyncTransactionSerializedEIP712,
  ZksyncTransactionSerializedEIP712,
  /** @deprecated Use `ZksyncTransactionType` instead */
  ZksyncTransactionType as ZkSyncTransactionType,
  ZksyncTransactionType,
  /** @deprecated Use `ZksyncRawBlockTransactions` instead */
  ZksyncRawBlockTransactions as ZkSyncRawBlockTransactions,
  ZksyncRawBlockTransactions,
  /** @deprecated Use `ZksyncRpcTransactionReceipt` instead */
  ZksyncRpcTransactionReceipt as ZkSyncRpcTransactionReceipt,
  ZksyncRpcTransactionReceipt,
  /** @deprecated Use `ZksyncTransactionDetails` instead */
  ZksyncTransactionDetails as ZkSyncTransactionDetails,
  ZksyncTransactionDetails,
} from './types/transaction.js'

export {
  type GetL2HashFromPriorityOpErrorType,
  getL2HashFromPriorityOp,
} from './utils/bridge/getL2HashFromPriorityOp.js'
export { undoL1ToL2Alias } from './utils/bridge/undoL1ToL2Alias.js'
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
export { parseEip712Transaction } from './utils/parseEip712Transaction.js'
