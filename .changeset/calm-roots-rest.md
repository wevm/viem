---
"viem": patch
---

Fixed `Actions.accounts.getConfigCommitment` in `viem/tempo` rejecting on chains without the configurable account precompile, where it now returns the zero commitment.
