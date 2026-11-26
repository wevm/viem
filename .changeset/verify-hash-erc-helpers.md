---
"viem": patch
---

Replaced ox's ERC-6492 and ERC-8010 modules in `verifyHash` and `parseErc8010Signature` with viem's own helpers, shrinking `verifyHash`, `verifyMessage` and `verifyTypedData` bundles.
