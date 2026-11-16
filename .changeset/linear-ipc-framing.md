---
"viem": patch
---

Kept IPC message framing state across `data` events and concatenated each message once, so large IPC responses are no longer rescanned and copied on every chunk.
