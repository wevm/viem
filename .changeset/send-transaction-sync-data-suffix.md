---
"viem": patch
---

Aligned `sendTransactionSync` `dataSuffix` behavior with `sendTransaction` so that calls passing only `dataSuffix` (without `data`) correctly append to `data ?? '0x'` instead of being silently dropped.
