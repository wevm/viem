---
"viem": patch
---

Fixed `estimateUserOperationGas` omitting `maxFeePerGas` and `maxPriorityFeePerGas` during User Operation preparation, which caused strict bundlers to reject gas estimation requests.
