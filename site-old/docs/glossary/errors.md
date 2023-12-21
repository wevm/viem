---
head:
  - - meta
    - property: og:title
      content: Errors
  - - meta
    - name: description
      content: Glossary of Errors in viem.
  - - meta
    - property: og:description
      content: Glossary of Errors in viem.

---

# Errors

All errors in viem extend the [`BaseError`](https://github.com/wagmi-dev/viem/blob/main/src/errors/base.ts).

## ABI

### `AbiConstructorNotFoundError`
### `AbiConstructorParamsNotFoundError`
### `AbiDecodingDataSizeInvalidError`
### `AbiDecodingDataSizeTooSmallError`
### `AbiDecodingZeroDataError`
### `AbiEncodingArrayLengthMismatchError`
### `AbiEncodingBytesSizeMismatchError`
### `AbiEncodingLengthMismatchError`
### `AbiErrorInputsNotFoundError`
### `AbiErrorNotFoundError`
### `AbiErrorSignatureNotFoundError`
### `AbiEventNotFoundError`
### `AbiEventSignatureEmptyTopicsError`
### `AbiEventSignatureNotFoundError`
### `AbiFunctionNotFoundError`
### `AbiFunctionOutputsNotFoundError`
### `AbiFunctionSignatureNotFoundError`
### `BytesSizeMismatchError`
### `DecodeLogTopicsMismatch`
### `InvalidAbiDecodingTypeError`
### `InvalidAbiEncodingTypeError`
### `InvalidArrayError`
### `InvalidDefinitionTypeError`
### `UnsupportedPackedAbiType`

## Account

### `AccountNotFoundError`

When no account is provided to an action that requires an account.

## Address

### `InvalidAddressError`

When address is invalid.

## Block

### `BlockNotFoundError`

## Chain

### `ChainDoesNotSupportContract`
### `ChainMismatchError`
### `ChainNotFoundError`
### `ClientChainNotConfiguredError`
### `InvalidChainIdError`

## Contract

### `CallExecutionError`
### `ContractFunctionExecutionError`
### `ContractFunctionRevertedError`
### `ContractFunctionZeroDataError`
### `RawContractError`

## Data

### `SizeExceedsPaddingSizeError`

## Encoding

### `DataLengthTooLongError`
### `DataLengthTooShortError`
### `IntegerOutOfRangeError`
### `InvalidBytesBooleanError`
### `InvalidHexBooleanError`
### `InvalidHexValueError`
### `OffsetOutOfBoundsError`
### `SizeOverflowError`

## ENS

### `EnsAvatarInvalidMetadataError`
### `EnsAvatarInvalidNftUriError`
### `EnsAvatarUnsupportedNamespaceError`
### `EnsAvatarUriResolutionError`

## Estimate Gas

### `EstimateGasExecutionError`

## Log

### `FilterTypeNotSupportedError`

## Node

### `ExecutionRevertedError`
### `FeeCapTooHighError`
### `FeeCapTooLowError`
### `InsufficientFundsError`
### `IntrinsicGasTooHighError`
### `IntrinsicGasTooLowError`
### `NonceMaxValueError`
### `NonceTooHighError`
### `NonceTooLowError`
### `TipAboveFeeCapError`
### `TransactionTypeNotSupportedError`
### `UnknownNodeError`

## Request

### `HttpRequestError`
### `RpcRequestError`
### `TimeoutError`
### `WebSocketRequestError`

## RPC

### `ChainDisconnectedError`
### `InternalRpcError`
### `InvalidInputRpcError`
### `InvalidParamsRpcError`
### `InvalidRequestRpcError`
### `JsonRpcVersionUnsupportedError`
### `LimitExceededRpcError`
### `MethodNotFoundRpcError`
### `MethodNotSupportedRpcError`
### `ParseRpcError`
### `ProviderDisconnectedError`
### `ProviderRpcError`
### `ResourceNotFoundRpcError`
### `ResourceUnavailableRpcError`
### `RpcError`
### `SwitchChainError`
### `TransactionRejectedRpcError`
### `UnauthorizedProviderError`
### `UnknownRpcError`
### `UnsupportedProviderMethodError`
### `UserRejectedRequestError`

## Transaction

### `FeeConflictError`
### `InvalidLegacyVError`
### `InvalidSerializableTransactionError`
### `InvalidSerializedTransactionError`
### `InvalidSerializedTransactionTypeError`
### `InvalidStorageKeySizeError`
### `TransactionExecutionError`
### `TransactionNotFoundError`
### `TransactionReceiptNotFoundError`
### `WaitForTransactionReceiptTimeoutError`

## Transport

### `UrlRequiredError`

