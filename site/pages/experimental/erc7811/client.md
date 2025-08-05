# Extending Client with ERC-7811 Actions [Setting up your Viem Client]

To use the experimental functionality of [ERC-7811](https://github.com/ethereum/ERCs/blob/master/ERCS/erc-7811.md), you can extend your existing (or new) Viem Client with experimental [ERC-7811](https://github.com/ethereum/ERCs/blob/master/ERCS/erc-7811.md) Actions.

```ts
import { createClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { erc7811Actions } from 'viem/experimental' // [!code focus]

const client = createClient({
  chain: mainnet,
  transport: http(),
}).extend(erc7811Actions()) // [!code focus]

const assets = await client.getAssets({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
})
```
