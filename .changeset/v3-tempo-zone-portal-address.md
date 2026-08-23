---
'viem': minor
---

**Breaking (`viem/tempo`):** Replaced chain-specific Zone portal registries with deterministic `Addresses.zonePortal(zoneId)` resolution.

```diff
-import { getPortalAddress } from 'viem/tempo/zones'
+import { Addresses } from 'viem/tempo'

-const portal = getPortalAddress(42_431, 7)
+const portal = Addresses.zonePortal(7)
```
