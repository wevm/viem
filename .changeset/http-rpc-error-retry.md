---
"viem": patch
---

Fixed the `http` transport to retry JSON-RPC errors from non-2xx responses by their HTTP status and `Retry-After` header, and exposed `status` and `headers` on `RpcRequestError`.
