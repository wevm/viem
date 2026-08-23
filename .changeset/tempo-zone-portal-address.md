---
'viem': minor
---

**Breaking (`viem/tempo`):** Replaced chain-specific Zone portal registries with deterministic `Addresses.zonePortal(id)` resolution for Zone IDs and chain IDs.

```diff
-import { getPortalAddress } from 'viem/tempo/zones'
+import { Addresses, Zone } from 'viem/tempo'

-const portal = getPortalAddress(42_431, 7)
+const portal = Addresses.zonePortal(Zone.b.id)
```
