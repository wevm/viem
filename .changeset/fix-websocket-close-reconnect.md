---
"viem": patch
---

Fixed WebSocket `close()` triggering an unintended reconnect loop. Calling `close()` on a socket RPC client now properly shuts down without attempting to reconnect. Also fixed a missing `return` in `withTimeout` that caused a redundant promise rejection after an `AbortError`.
