---
"viem": patch
---

Fixed `watchEvent` so concurrent polling watchers on one client each honor their own `events` and `strict` instead of sharing the first watcher's filter.
