---
"viem": patch
---

Fixed memory leak in observe utility where cache entries were never cleaned up after all listeners unsubscribe.
