---
'viem': minor
---

**Breaking (`viem/tempo`):** Moved Zone exports from `viem/tempo/zones` into `viem/tempo`.

```diff
-import { Abis, Addresses, http, zoneModerato } from 'viem/tempo/zones'
+import { Abis, Addresses, http, Zone } from 'viem/tempo'
```
