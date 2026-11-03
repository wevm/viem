---
"viem": patch
---

Cached signature hashes in `toSignatureHash`, so selector lookups in `decodeFunctionData`, `decodeEventLog`, `decodeErrorResult` and `encodeFunctionData` no longer hash every ABI item on each call.
