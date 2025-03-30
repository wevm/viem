---
"viem": patch
---

Ensured that the `keepAlive` and `reconnect` parameters are passed through to 
the underlying implementation (`getWebSocketRpcClient()`) when the top level
`webSocket()` transport factory function is called with them specified.
