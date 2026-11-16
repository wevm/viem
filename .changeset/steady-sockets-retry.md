---
"viem": patch
---

Kept WebSocket and IPC clients reconnecting after a failed attempt, and dropped a client whose attempts ran out so the next request opens a new socket.
