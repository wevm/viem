# Extending Client with Solady Actions [Setting up your Viem Client]

To use the experimental functionality of Solady, you can extend your existing (or new) Viem Client with experimental Solady Actions.

```ts
import { createPublicClient, createWalletClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { soladyActions } from 'viem/experimental' // [!code focus]

const walletClient = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum!),
}).extend(soladyActions()) // [!code focus]

const id = await walletClient.signMessage({/* ... */})
```
