---
"viem": patch
---

Reduced per-request overhead of `RpcClient.http` and `RpcClient.webSocket` (and the `http` and `webSocket` transports) by building the `onRequest` `Request` only when the hook is set and the `TimeoutError` only when a request times out.
