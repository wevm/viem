---
"viem": patch
---

`viem/tempo`: Added hardfork-aware `getRemainingLimit` that uses `getRemainingLimitWithPeriod` on T3+ chains. Returns `{ remaining, periodEnd }` object.
