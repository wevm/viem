---
"viem": patch
---

Read the bridge addresses, fees, and token metadata concurrently in the ZKsync `deposit` Action, and reused the bridge addresses instead of requesting them twice.
