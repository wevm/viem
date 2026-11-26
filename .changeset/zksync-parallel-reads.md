---
"viem": patch
---

Reduced round trips in zkSync `requestExecute`, `deposit`, `withdraw`, `finalizeWithdrawal` and `claimFailedDeposit`, and OP Stack `estimateOperatorFee`, by requesting independent reads in parallel.
