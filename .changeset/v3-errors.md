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

JSON-RPC and provider errors moved to Ox `RpcResponse` and `Provider` namespaces.

```diff
- import { InvalidInputRpcError, ProviderRpcError, UserRejectedRequestError } from 'viem'
+ import { Provider, RpcResponse } from 'ox'

- error instanceof InvalidInputRpcError
+ error instanceof RpcResponse.InvalidInputError
- error instanceof ProviderRpcError
+ error instanceof Provider.ProviderRpcError
- error instanceof UserRejectedRequestError
+ error instanceof Provider.UserRejectedRequestError
```

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
