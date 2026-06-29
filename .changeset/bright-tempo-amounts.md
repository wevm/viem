---
"viem": minor
---

**Breaking (viem/tempo):** Changed Tempo token balance and allowance reads to return `Amount` objects.

```diff
-const balance = await client.token.getBalance({ token })
-// ^? bigint
+const balance = await client.token.getBalance({ token })
+// ^? { amount: bigint; decimals?: number; formatted?: string }

-const allowance = await client.token.getAllowance({ account, spender, token })
-// ^? bigint
+const allowance = await client.token.getAllowance({ account, spender, token })
+// ^? { amount: bigint; decimals?: number; formatted?: string }
```
