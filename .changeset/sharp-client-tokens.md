---
"viem": minor
---

**Breaking:** Changed ERC-20 token actions to resolve named tokens from client `tokens` config instead of built-in chain `tokens` config.

```diff
 import { createPublicClient, http } from 'viem'
 import { mainnet } from 'viem/chains'
+import { usdc } from 'viem/tokens'

-const client = createPublicClient({ chain: mainnet, transport: http() })
+const client = createPublicClient({
+  chain: mainnet,
+  tokens: { usdc },
+  transport: http(),
+})

 const balance = await client.token.getBalance({ account, token: 'usdc' })
```
