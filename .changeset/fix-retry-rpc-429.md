---
"viem": patch
---

Fixed `shouldRetry` not retrying on JSON-RPC error code `429`. Some providers (e.g. Alchemy) return rate-limit errors as RPC-level `429` codes rather than HTTP `429` status codes. These are now retried consistently with HTTP-level `429` errors.
