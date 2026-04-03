---
"viem": patch
---

fix(utils): delete empty listener entries from listenersCache

Removes stale Map entries when all listeners for an observerId are unsubscribed, preventing memory leaks in long-running applications that create/destroy many clients.

Fixes wevm/viem#4390
