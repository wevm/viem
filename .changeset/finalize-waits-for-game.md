---
"viem": patch
---

Fixed `getTimeToFinalize` and `waitToFinalize` to also wait for the proof's dispute game to resolve and pass its finality delay, instead of only the proof maturity delay.
