---
"viem": patch
---

Fixed `socketClient.close()` triggering an unwanted reconnect loop that prevented the Node.js process from exiting.
