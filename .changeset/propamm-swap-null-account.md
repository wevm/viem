---
"viem": patch
---

Fixed `propAmm.swap`, `propAmm.swapSync`, and `propAmm.swap.estimateGas` defaulting `recipient` and `customerId` from the client account when `account` was `null`.
