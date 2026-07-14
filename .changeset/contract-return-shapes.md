---
"viem": major
---

Added configurable contract return shapes and defaulted multi-output results to named objects.

```diff
-const [foo, bar] = await Actions.contract.read(client, options)
+const { foo, bar } = await Actions.contract.read(client, options)
```
