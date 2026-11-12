---
'viem': patch
---

Fixed batch scheduler stale timer not being cancelled on premature flush, causing the `wait` parameter to be ineffective when `shouldSplitBatch` triggers an early batch execution.
