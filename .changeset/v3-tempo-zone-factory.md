---
'viem': minor
---

**Breaking (`viem/tempo`):** Replaced curried Zone network factories with `Zone.from`, which accepts a complete chain configuration.

```diff
-const zone = zoneModerato(7)
+const zone = Zone.from({
+  id: 4_217_000_007,
+  name: 'Zone B',
+  rpcUrls: {
+    default: { http: ['https://rpc-zone-b.testnet.tempo.xyz'] },
+  },
+  sourceId: 42_431,
+})
```
