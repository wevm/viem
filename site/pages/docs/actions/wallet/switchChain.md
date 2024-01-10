---
description: Switch the target chain in a wallet.
---

# switchChain

Switch the target chain in a wallet.

## Usage

:::code-group

```ts [example.ts]
import { avalanche } from 'viem/chains'
import { walletClient } from './client'
 
await walletClient.switchChain({ id: avalanche.id }) // [!code focus]
```

```ts [client.ts]
import { createWalletClient, custom } from 'viem'

export const walletClient = createWalletClient({
  transport: custom(window.ethereum)
})
```

:::


## Parameters

### id

- **Type:** `number`

The Chain ID.

## JSON-RPC Methods

[`eth_switchEthereumChain`](https://eips.ethereum.org/EIPS/eip-3326)