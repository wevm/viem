# Extending Client with ERC-7895 Actions [Setting up your Viem Client]

To use the experimental functionality of [ERC-7895](https://github.com/ethereum/ERCs/blob/4d3d641ee3c84750baf461b8dd71d27c424417a9/ERCS/erc-7895.md), you can extend your existing (or new) Viem Client with experimental [ERC-7895](https://github.com/ethereum/ERCs/blob/4d3d641ee3c84750baf461b8dd71d27c424417a9/ERCS/erc-7895.md) Actions.

```ts
import { createClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { erc7895Actions } from 'viem/experimental' // [!code focus]

const client = createClient({
  chain: mainnet,
  transport: http(),
}).extend(erc7895Actions()) // [!code focus]

const subAccount = await client.addSubAccount({
  keys: [{ key: '0x0000000000000000000000000000000000000000', type: 'address' }],
  type: 'create',
})
```
