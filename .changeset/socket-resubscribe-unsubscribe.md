---
"viem": patch
---

Fixed `unsubscribe()` on `webSocket` and `ipc` transports using a stale subscription id after a reconnect, which leaked the subscription.
