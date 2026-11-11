---
"viem": patch
---

Updated `verifyHash` to make its onchain verification calls with CCIP-Read disabled, so an `OffchainLookup` revert from a signer now returns `false`.
