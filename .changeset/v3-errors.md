---
"viem": major
---

Error classes and error configuration were moved from flat root exports into the `Errors`, `RpcError`, and `ContractError` namespaces.

```diff
- import {
-   BaseError,
-   setErrorConfig,
-   ExecutionRevertedError,
-   InsufficientFundsError,
-   ContractFunctionExecutionError,
-   ContractFunctionRevertedError,
- } from 'viem'
+ import { ContractError, Errors, RpcError } from 'viem'

- setErrorConfig({ version: 'app@1.0.0' })
- throw new BaseError('Example')
+ Errors.setConfig({ version: 'app@1.0.0' })
+ throw new Errors.BaseError('Example')

- error instanceof ExecutionRevertedError
- error instanceof InsufficientFundsError
- error instanceof ContractFunctionExecutionError
- error instanceof ContractFunctionRevertedError
+ error instanceof RpcError.ExecutionRevertedError
+ error instanceof RpcError.InsufficientFundsError
+ error instanceof ContractError.ContractFunctionExecutionError
+ error instanceof ContractError.ContractFunctionRevertedError
```

Node execution errors were grouped under `RpcError` (mostly keeping their class names; `UnknownNodeError` became `RpcError.UnknownRpcError`).

```diff
- import {
-   FeeCapTooHighError,
-   FeeCapTooLowError,
-   NonceTooHighError,
-   NonceTooLowError,
-   NonceMaxValueError,
-   IntrinsicGasTooHighError,
-   IntrinsicGasTooLowError,
-   TransactionTypeNotSupportedError,
-   TipAboveFeeCapError,
-   UnknownNodeError,
- } from 'viem'
+ import { RpcError } from 'viem'

- error instanceof FeeCapTooHighError
- error instanceof FeeCapTooLowError
- error instanceof NonceTooHighError
- error instanceof NonceTooLowError
- error instanceof NonceMaxValueError
- error instanceof IntrinsicGasTooHighError
- error instanceof IntrinsicGasTooLowError
- error instanceof TransactionTypeNotSupportedError
- error instanceof TipAboveFeeCapError
- error instanceof UnknownNodeError
+ error instanceof RpcError.FeeCapTooHighError
+ error instanceof RpcError.FeeCapTooLowError
+ error instanceof RpcError.NonceTooHighError
+ error instanceof RpcError.NonceTooLowError
+ error instanceof RpcError.NonceMaxValueError
+ error instanceof RpcError.IntrinsicGasTooHighError
+ error instanceof RpcError.IntrinsicGasTooLowError
+ error instanceof RpcError.TransactionTypeNotSupportedError
+ error instanceof RpcError.TipAboveFeeCapError
+ error instanceof RpcError.UnknownRpcError
```

Contract function errors moved under `ContractError`, execution wrappers consolidated into `RpcError.ExecutionError`, and `CounterfactualDeploymentFailedError` was removed.

```diff
- import {
-   CallExecutionError,
-   ContractFunctionExecutionError,
-   ContractFunctionRevertedError,
-   ContractFunctionZeroDataError,
-   CounterfactualDeploymentFailedError,
-   EstimateGasExecutionError,
-   RawContractError,
-   TransactionExecutionError,
- } from 'viem'
+ import { ContractError, RpcError } from 'viem'

- error instanceof CallExecutionError
- error instanceof EstimateGasExecutionError
- error instanceof TransactionExecutionError
+ error instanceof RpcError.ExecutionError
- error instanceof ContractFunctionExecutionError
- error instanceof ContractFunctionRevertedError
- error instanceof ContractFunctionZeroDataError
- error instanceof CounterfactualDeploymentFailedError
- error instanceof RawContractError
+ error instanceof ContractError.ContractFunctionExecutionError
+ error instanceof ContractError.ContractFunctionRevertedError
+ error instanceof ContractError.ContractFunctionZeroDataError
+ error instanceof ContractError.RawContractError
```

Stable action errors moved from the package root into their owning `Actions` namespaces.

```diff
- import {
-   AtomicityNotSupportedError,
-   BaseFeeScalarError,
-   BlockNotFoundError,
-   BundleFailedError,
-   Eip1559FeesNotSupportedError,
-   EnsAvatarInvalidMetadataError,
-   EnsAvatarInvalidNftUriError,
-   EnsAvatarUnsupportedNamespaceError,
-   EnsAvatarUriResolutionError,
-   MaxFeePerGasTooLowError,
-   TransactionNotFoundError,
-   TransactionReceiptNotFoundError,
-   UnsupportedNonOptionalCapabilityError,
-   WaitForCallsStatusTimeoutError,
-   WaitForTransactionReceiptTimeoutError,
- } from 'viem'
+ import { Actions } from 'viem'

+ Actions.block.BlockNotFoundError
+ Actions.ens.EnsAvatarInvalidMetadataError
+ Actions.ens.EnsAvatarInvalidNftUriError
+ Actions.ens.EnsAvatarUnsupportedNamespaceError
+ Actions.ens.EnsAvatarUriResolutionError
+ Actions.fee.BaseFeeScalarError
+ Actions.fee.Eip1559FeesNotSupportedError
+ Actions.transaction.MaxFeePerGasTooLowError
+ Actions.transaction.TransactionNotFoundError
+ Actions.transaction.TransactionReceiptNotFoundError
+ Actions.transaction.WaitForReceiptTimeoutError
+ Actions.wallet.AtomicityNotSupportedError
+ Actions.wallet.BundleFailedError
+ Actions.wallet.UnsupportedNonOptionalCapabilityError
+ Actions.wallet.WaitForCallsStatusTimeoutError
```

JSON-RPC and provider errors moved to the `RpcResponse` and `Provider` namespaces (re-exported from `viem/utils`). The EIP-1474 request errors map onto `RpcResponse.*` — note `JsonRpcVersionUnsupportedError` became `RpcResponse.VersionNotSupportedError` — and the EIP-1193/EIP-5792 provider errors map onto `Provider.*`, with `ProviderDisconnectedError` shortened to `Provider.DisconnectedError`. `RpcRequestError` has no direct class; RPC error responses now surface as the matching `RpcResponse.*` error. The `RpcErrorCode` and `ProviderRpcErrorCode` unions were removed — read the static `code` on the error classes instead.

```diff
- import {
-   ChainDisconnectedError,
-   EIP1193ProviderRpcError,
-   InternalRpcError,
-   InvalidInputRpcError,
-   InvalidParamsRpcError,
-   InvalidRequestRpcError,
-   JsonRpcVersionUnsupportedError,
-   LimitExceededRpcError,
-   MethodNotFoundRpcError,
-   MethodNotSupportedRpcError,
-   ParseRpcError,
-   ProviderDisconnectedError,
-   ProviderRpcError,
-   ResourceNotFoundRpcError,
-   ResourceUnavailableRpcError,
-   SwitchChainError,
-   TransactionRejectedRpcError,
-   UnauthorizedProviderError,
-   UnsupportedProviderMethodError,
-   UserRejectedRequestError,
- } from 'viem'
+ import { Provider, RpcResponse } from 'viem/utils'

- error instanceof ParseRpcError
- error instanceof InvalidRequestRpcError
- error instanceof MethodNotFoundRpcError
- error instanceof InvalidParamsRpcError
- error instanceof InternalRpcError
- error instanceof InvalidInputRpcError
- error instanceof ResourceNotFoundRpcError
- error instanceof ResourceUnavailableRpcError
- error instanceof TransactionRejectedRpcError
- error instanceof MethodNotSupportedRpcError
- error instanceof LimitExceededRpcError
- error instanceof JsonRpcVersionUnsupportedError
+ error instanceof RpcResponse.ParseError
+ error instanceof RpcResponse.InvalidRequestError
+ error instanceof RpcResponse.MethodNotFoundError
+ error instanceof RpcResponse.InvalidParamsError
+ error instanceof RpcResponse.InternalError
+ error instanceof RpcResponse.InvalidInputError
+ error instanceof RpcResponse.ResourceNotFoundError
+ error instanceof RpcResponse.ResourceUnavailableError
+ error instanceof RpcResponse.TransactionRejectedError
+ error instanceof RpcResponse.MethodNotSupportedError
+ error instanceof RpcResponse.LimitExceededError
+ error instanceof RpcResponse.VersionNotSupportedError

- error instanceof ProviderRpcError // or EIP1193ProviderRpcError
- error instanceof UserRejectedRequestError
- error instanceof UnauthorizedProviderError
- error instanceof UnsupportedProviderMethodError
- error instanceof ProviderDisconnectedError
- error instanceof ChainDisconnectedError
- error instanceof SwitchChainError
+ error instanceof Provider.ProviderRpcError
+ error instanceof Provider.UserRejectedRequestError
+ error instanceof Provider.UnauthorizedError
+ error instanceof Provider.UnsupportedMethodError
+ error instanceof Provider.DisconnectedError
+ error instanceof Provider.ChainDisconnectedError
+ error instanceof Provider.SwitchChainError
```

The EIP-5792 wallet-call errors likewise live on `Provider.*`: `AtomicReadyWalletRejectedUpgradeError`, `BundleTooLargeError`, `DuplicateIdError`, `UnknownBundleIdError`, and `UnsupportedChainIdError` keep their names.

ABI lookup, encoding, and log-decoding errors consolidated into the ABI namespaces re-exported by viem. The `*NotFoundError` family folds into `AbiItem.NotFoundError`.

```diff
- import {
-   AbiConstructorNotFoundError,
-   AbiDecodingDataSizeTooSmallError,
-   AbiEncodingArrayLengthMismatchError,
-   AbiEncodingBytesSizeMismatchError,
-   AbiEncodingLengthMismatchError,
-   AbiErrorNotFoundError,
-   AbiErrorSignatureNotFoundError,
-   AbiEventNotFoundError,
-   AbiEventSignatureEmptyTopicsError,
-   AbiEventSignatureNotFoundError,
-   AbiFunctionNotFoundError,
-   AbiFunctionSignatureNotFoundError,
-   DecodeLogDataMismatch,
-   DecodeLogTopicsMismatch,
-   InvalidAbiDecodingTypeError,
-   InvalidAbiEncodingTypeError,
-   UnsupportedPackedAbiType,
- } from 'viem'
+ import { AbiEvent, AbiItem, AbiParameters } from 'viem'

- error instanceof AbiConstructorNotFoundError // or AbiError/AbiEvent/AbiFunction NotFound / SignatureNotFound
+ error instanceof AbiItem.NotFoundError
- error instanceof AbiDecodingDataSizeTooSmallError
+ error instanceof AbiParameters.DataSizeTooSmallError
- error instanceof AbiEncodingArrayLengthMismatchError
+ error instanceof AbiParameters.ArrayLengthMismatchError
- error instanceof AbiEncodingBytesSizeMismatchError
+ error instanceof AbiParameters.BytesSizeMismatchError
- error instanceof AbiEncodingLengthMismatchError
+ error instanceof AbiParameters.LengthMismatchError
- error instanceof InvalidAbiDecodingTypeError // or InvalidAbiEncodingTypeError, UnsupportedPackedAbiType
+ error instanceof AbiParameters.InvalidTypeError
- error instanceof AbiEventSignatureEmptyTopicsError
+ error instanceof AbiEvent.SelectorTopicNotFoundError
- error instanceof DecodeLogDataMismatch
+ error instanceof AbiEvent.DataMismatchError
- error instanceof DecodeLogTopicsMismatch
+ error instanceof AbiEvent.TopicsMismatchError
```

(`InvalidAbiParameterError` lives on the singular `AbiParameter` namespace, re-exported from `viem/utils`.)

Serialization, signature, and RLP errors moved to their owning namespaces.

```diff
- import {
-   InvalidLegacyVError,
-   InvalidSerializableTransactionError,
-   InvalidSerializedTransactionError,
-   InvalidSerializedTransactionTypeError,
-   RlpDepthLimitExceededError,
-   RlpListBoundaryExceededError,
-   RlpTrailingBytesError,
- } from 'viem'
+ import { Rlp, Signature, TxEnvelope } from 'viem'

- error instanceof InvalidLegacyVError
+ error instanceof Signature.InvalidVError
- error instanceof InvalidSerializableTransactionError
+ error instanceof TxEnvelope.InvalidTypeError
- error instanceof InvalidSerializedTransactionError
+ error instanceof TxEnvelope.InvalidSerializedError
- error instanceof InvalidSerializedTransactionTypeError
+ error instanceof TxEnvelope.InvalidSerializedTypeError
- error instanceof RlpDepthLimitExceededError
+ error instanceof Rlp.DepthLimitExceededError
- error instanceof RlpListBoundaryExceededError
+ error instanceof Rlp.ListBoundaryExceededError
- error instanceof RlpTrailingBytesError
+ error instanceof Rlp.TrailingBytesError
```

Transport-level request errors moved to `RpcClient`: `HttpRequestError` became `RpcClient.HttpError`, and the `WebSocketRequestError` wrapper was removed in favor of `RpcClient.SocketClosedError`/`RpcClient.TimeoutError` plus the matching `RpcResponse` errors for error responses. `ClientChainNotConfiguredError` folds into `Chain.NotFoundError`.

The action-level error mappers were removed: `getCallError`, `getEstimateGasError`, and `getTransactionError` are replaced by constructing `RpcError.ExecutionError` directly, and `containsNodeError` by checking the result of `RpcError.fromRpcError`.

```diff
- import { getCallError, getEstimateGasError, getTransactionError, containsNodeError } from 'viem/utils'
+ import { RpcError } from 'viem'

- throw getCallError(err, { docsPath, ...args })
+ throw new RpcError.ExecutionError(err, options)
- const isNodeError = containsNodeError(err)
+ const isNodeError = !(RpcError.fromRpcError(err) instanceof RpcError.UnknownRpcError)
```

Seven error conditions were engineered away and their classes removed without replacement: `FeeConflictError` (fee-field exclusivity is now enforced at the type level), `AccountStateConflictError` and `StateAssignmentConflictError` (the record-shaped state overrides make the conflicts unrepresentable), `InvalidDefinitionTypeError` (`AbiItem.getSignature` accepts all item types), `AbiDecodingDataSizeInvalidError` (already unthrown in v2.55), `AbiConstructorParamsNotFoundError` and `AbiErrorInputsNotFoundError` (argument-count mismatches surface as `AbiParameters.LengthMismatchError`), and `AbiFunctionOutputsNotFoundError` (`AbiFunction.decodeResult` returns `undefined` for functions without outputs).

Primitive utility errors moved to their owning namespaces; flat `*ErrorType` aliases were removed in favor of namespace classes and function error unions.

```diff
-import { AbiDecodingZeroDataError, InvalidAddressError, type DecodeAbiParametersErrorType } from 'viem'
+import { AbiParameters, Address } from 'viem'

-error instanceof AbiDecodingZeroDataError
-error instanceof InvalidAddressError
+error instanceof AbiParameters.ZeroDataError
+error instanceof Address.InvalidAddressError
+type DecodeError = AbiParameters.decode.ErrorType
```
