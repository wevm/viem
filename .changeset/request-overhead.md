---
"viem": patch
---

Reduced per-request overhead of the `http`, `webSocket` and `ipc` transports by building the `onFetchRequest` `Request` only when the hook is set and the `TimeoutError` only when a request times out, and fetched the withdrawal receipt once in the ZKsync `finalizeWithdrawal` and `isWithdrawalFinalized` actions.
