---
"viem": patch
---

Added multicall batching support for `getBalance` via multicall3's `getEthBalance`. When the client has `batch.multicall` enabled, `getBalance` calls are now batched via `eth_call` instead of making individual `eth_getBalance` RPC calls.
