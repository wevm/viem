---
'viem': minor
---

**Breaking (`viem/tempo`):** Replaced curried Zone network factories with built-in Zone definitions and `Zone.from` for custom chains.

```diff
-const zone = zoneModerato(6)
+const zone = Zone.a
```
