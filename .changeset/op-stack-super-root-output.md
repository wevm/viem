---
"viem": patch
---

Added `usesSuperRoots` to OP Stack `Actions.l1.getL2Output` and `Actions.l1.waitToProve` outputs, so `Actions.l2.buildProveWithdrawal` resolved the L2 block for super-root outputs passed as `output`.
