---
"viem": patch
---

Fixed `shouldRetry` to handle RPC code 429 in batch mode, where some providers (e.g. Alchemy) return HTTP 200 with a JSON-RPC body of `{ code: 429 }` instead of an HTTP 429.
