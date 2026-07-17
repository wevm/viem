---
"viem": major
---

Added configurable contract return shapes, defaulting multi-output results to named objects; fully unnamed outputs stay tuples.

```diff
-const [foo, bar] = await Actions.contract.read(client, options)
+const { foo, bar } = await Actions.contract.read(client, options)
```
