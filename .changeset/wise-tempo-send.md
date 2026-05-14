---
"viem": patch
---

`viem/tempo`: Updated `Actions.wallet.send` parameters to match the latest wallet RPC schema: renamed `value` to `amount`, added an optional `memo` field (UTF-8, max 32 bytes; rejected for non-TIP-20 tokens), and widened `token` to also accept curated tokenlist symbols.

```diff
await Actions.wallet.send(client, {
+  amount: '1.5',
+  memo: 'thanks',
   to: '0x...',
-  token: '0x...',
+  token: 'pathUsd',
-  value: '1.5',
})
```
