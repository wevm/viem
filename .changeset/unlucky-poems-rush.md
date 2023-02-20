---
"viem": patch
---

Decorated Clients with their respective Actions.

Example:

```diff
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
-import { getBlockNumber } from 'viem/public'

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})

- const blockNumber = await getBlockNumber(client)
+ const blockNumber = await client.getBlockNumber()
```