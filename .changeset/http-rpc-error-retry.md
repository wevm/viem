---
'viem': patch
---

Fixed the `http` transport, including under the `fallback` transport, to retry JSON-RPC errors from non-2xx responses by their HTTP status and `Retry-After` header, added `rpcError` to `RpcClient.HttpError` for those responses, and set that `RpcClient.HttpError` (with its `status` and `headers`) as the `cause` of the JSON-RPC error they surface as.
