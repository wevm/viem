---
"viem": major
---

Enabled CCIP Read through an allowlisted batch gateway by default and bounded requests, responses, recursive lookups, and batch nesting.

```diff
  const client = Client.create({
+   ccipRead: false,
    transport: http(),
  })
```
