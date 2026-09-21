---
"viem": major
---

Resynced Tempo contract ABIs and added the current committee address.

```diff
 // Abis.earnMerkleRewardDistributor contract calls
-functionName: 'fundWithAssets',
-args: [funder, assets, minEarnShares],
+functionName: 'fundAndPublishRoot',
+args: [settlementId, expectedRootVersion, funder, assets, minEarnShares, root, totalEntitlement, statementHash],

 functionName: 'publishRoot',
-args: [root, totalEntitlement, statementHash],
+args: [expectedRootVersion, root, totalEntitlement, statementHash],

-const verifierAbi = Abis.zone
+const verifierAbi = Abis.core

-const selector = Selectors.zoneVerifier.verify
+const selector = Selectors.zoneVerifier.verify[
+  'verify(uint32,uint64,uint64,bytes32,uint64,(bytes32,bytes32),(bytes32,bytes32,uint64,uint64),bytes32,bytes,bytes)'
+]
```
