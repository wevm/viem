---
"viem": patch
---

Fixed batched `http` and multicall requests flushing before `wait` elapsed after an earlier batch was split at `batchSize`.
