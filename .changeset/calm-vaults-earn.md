---
"viem": patch
---

**Breaking(`viem/tempo`)**: Updated Earn ABI names and required private Zone actions to identify their vault and Zone.

```diff
-Abis.vaultAdapter
-Abis.vaultEngine
-Abis.vaultEngineAsync
-Abis.vaultEngineShares
-Abis.vaultRewards
-Abis.zoneGateway
-Abis.zoneGatewayBase
-Abis.zoneGatewayCallbackData
+Abis.earnVault
+Abis.earnFees
+Abis.earnEngine
+Abis.earnEngineAsyncRedeem
+Abis.earnEngineInKindDeposit
+Abis.earnContributionController
+Abis.earnRouter
+Abis.earnRouterCallbackData

 const prepared = await Actions.earn.privateDeposit.prepare(client, {
   gateway,
+  vault,
+  zoneId,
 })
```
