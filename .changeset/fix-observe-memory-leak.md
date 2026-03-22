---
"viem": patch
---

Fixed memory leak in `observe` where empty listener entries accumulated in `listenersCache` and `cleanupCache` after all observers unsubscribed.
