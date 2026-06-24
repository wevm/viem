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

Contract function errors kept their class names but were grouped under `ContractError`, while `CallExecutionError` and `CounterfactualDeploymentFailedError` were removed.

```diff
- import {
-   CallExecutionError,
-   ContractFunctionExecutionError,
-   ContractFunctionRevertedError,
-   ContractFunctionZeroDataError,
-   CounterfactualDeploymentFailedError,
-   RawContractError,
- } from 'viem'
+ import { ContractError } from 'viem'

- error instanceof CallExecutionError
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
