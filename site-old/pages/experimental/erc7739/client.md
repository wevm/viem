# Extending Client with ERC-7739 Actions [Setting up your Viem Client]

To use the experimental functionality of ERC-7739, you can extend your existing (or new) Viem Client with experimental ERC-7739 Actions.

```ts
import { createPublicClient, createWalletClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { erc7739Actions } from 'viem/experimental' // [!code focus]

const walletClient = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum!),
}).extend(erc7739Actions()) // [!code focus]

const id = await walletClient.signMessage({/* ... */})
```
