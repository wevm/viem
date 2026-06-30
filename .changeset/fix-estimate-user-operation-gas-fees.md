---
"viem": patch
---

Fixed `estimateUserOperationGas` omitting `fees` during User Operation preparation, which caused strict bundlers to reject gas estimation requests.