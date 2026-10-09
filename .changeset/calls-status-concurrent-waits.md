---
"viem": patch
---

Fixed `waitForCallsStatus` resolving concurrent waits with the first call's options and hanging on a later wait for the same id after concurrent waits had settled.
