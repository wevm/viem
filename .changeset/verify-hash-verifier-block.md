---
"viem": patch
---

Updated `verifyHash` to use the deployless validator when `blockNumber` is before the chain's `erc6492Verifier` `blockCreated`.
