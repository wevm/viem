---
"viem": minor
---

**Breaking:** A chain is now required for the `sendTransaction`, `writeContract`, `deployContract` Actions.

You can hoist the Chain on the Client:

```diff
import { createWalletClient, custom, getAccount } from 'viem'
import { mainnet } from 'viem/chains'

export const walletClient = createWalletClient({
+ chain: mainnet,
  transport: custom(window.ethereum)
})
 
const account = getAccount('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266')
 
const hash = await walletClient.sendTransaction({ 
  account,
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: 1000000000000000000n
})
```

Alternatively, you can pass the Chain directly to the Action:

```diff
import { createWalletClient, custom, getAccount } from 'viem'
import { mainnet } from 'viem/chains'

export const walletClient = createWalletClient({
- chain: mainnet,
  transport: custom(window.ethereum)
})
 
const account = getAccount('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266')
 
const hash = await walletClient.sendTransaction({ 
  account,
+ chain: mainnet,
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: 1000000000000000000n
})
```