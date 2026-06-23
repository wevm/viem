---
"viem": major
---

Error classes and error configuration were moved from flat root exports into the `Errors`, `NodeError`, and `ContractError` namespaces.

```diff
- import {
-   BaseError,
-   setErrorConfig,
-   ExecutionRevertedError,
-   InsufficientFundsError,
-   ContractFunctionExecutionError,
-   ContractFunctionRevertedError,
- } from 'viem'
+ import { ContractError, Errors, NodeError } from 'viem'

- setErrorConfig({ version: 'app@1.0.0' })
- throw new BaseError('Example')
+ Errors.setConfig({ version: 'app@1.0.0' })
+ throw new Errors.BaseError('Example')

- error instanceof ExecutionRevertedError
- error instanceof InsufficientFundsError
- error instanceof ContractFunctionExecutionError
- error instanceof ContractFunctionRevertedError
+ error instanceof NodeError.ExecutionRevertedError
+ error instanceof NodeError.InsufficientFundsError
+ error instanceof ContractError.ContractFunctionExecutionError
+ error instanceof ContractError.ContractFunctionRevertedError
```

Node execution errors kept their class names but were grouped under `NodeError`.

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
+ import { NodeError } from 'viem'

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
+ error instanceof NodeError.FeeCapTooHighError
+ error instanceof NodeError.FeeCapTooLowError
+ error instanceof NodeError.NonceTooHighError
+ error instanceof NodeError.NonceTooLowError
+ error instanceof NodeError.NonceMaxValueError
+ error instanceof NodeError.IntrinsicGasTooHighError
+ error instanceof NodeError.IntrinsicGasTooLowError
+ error instanceof NodeError.TransactionTypeNotSupportedError
+ error instanceof NodeError.TipAboveFeeCapError
+ error instanceof NodeError.UnknownNodeError
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
