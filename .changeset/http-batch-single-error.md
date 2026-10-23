---
"viem": patch
---

Fixed the `http` transport with `batch` enabled throwing `Cannot read properties of undefined (reading 'error')` when the server answers a batch with a single JSON-RPC error object (e.g. rate limited or batch too large) instead of an array. Each request in the batch now rejects with that error.
