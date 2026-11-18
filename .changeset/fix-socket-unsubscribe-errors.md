---
"viem": patch
---

Fixed WebSocket and IPC unsubscribe requests hanging on socket failures or missing responses, without raising unhandled rejections when the result is not awaited.
