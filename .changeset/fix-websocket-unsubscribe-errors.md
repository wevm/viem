---
"viem": patch
---

Fixed WebSocket unsubscribe promises hanging on socket errors or missing responses and leaking pending request callbacks.
