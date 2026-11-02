---
'viem': patch
---

Fixed the `http` transport, including under the `fallback` transport, to retry JSON-RPC errors from non-2xx responses by their HTTP status and `Retry-After` header, and added `rpcError` to `RpcClient.HttpError` for those responses.
