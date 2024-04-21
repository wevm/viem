---
"viem": patch
---

Fixed issue where fallback transports with a webSocket transport would not utilize `eth_subscribe` in watcher actions.
