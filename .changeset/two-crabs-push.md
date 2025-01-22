---
"viem": minor
---

Added raw revert data field to `ContractFunctionRevertedError` so that raw revert data is always programmatically accessible if provided, regardless of whether the error was successfully decoded via the provided ABI.
