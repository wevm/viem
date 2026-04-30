---
"viem": patch
---

Stripped basic-auth credentials (`user:pass@`) from URLs surfaced in
error meta-messages (`HttpRequestError`, `WebSocketRequestError`,
`RpcRequestError`, `TimeoutError`).
