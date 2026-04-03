---
"viem": patch
---

fix(transports): prevent reconnect on intentional WebSocket close

Prevents the WebSocket transport from reconnecting when close() is called explicitly.
Fixes wevm/viem#4378
