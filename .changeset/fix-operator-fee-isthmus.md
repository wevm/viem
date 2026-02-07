---
"viem": patch
---

Fixed Operator Fee estimation for Isthmus upgrade by using the `getOperatorFee` function from the Gas Price Oracle instead of manually computing from L1Block parameters.
