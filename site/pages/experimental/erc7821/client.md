# Extending Client with ERC-7821 Actions [Setting up your Viem Client]

To use the experimental functionality of [ERC-7821](https://eips.ethereum.org/EIPS/eip-7821), you can extend your existing (or new) Viem Client with experimental [ERC-7821](https://eips.ethereum.org/EIPS/eip-7821) Actions.

```ts
import { createClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { erc7821Actions } from 'viem/experimental' // [!code focus]

const client = createClient({
  chain: mainnet,
  transport: http(),
}).extend(erc7821Actions()) // [!code focus]

const hash = await client.execute({/* ... */})
```
