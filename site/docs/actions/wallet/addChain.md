---
head:
  - - meta
    - property: og:title
      content: addChain
  - - meta
    - name: description
      content: Adds an EVM chain to the wallet.
  - - meta
    - property: og:description
      content: Adds an EVM chain to the wallet.

---

# addChain

Adds an EVM chain to the wallet.

## Usage

::: code-group

```ts [example.ts]
import { avalanche } from 'viem/chains'
import { walletClient } from './client'
 
await walletClient.addChain({ chain: avalanche }) // [!code focus]
```

```ts [client.ts]
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'

export const walletClient = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum)
})
```

:::

## Parameters

### chain

- **Type:** [`Chain`](/docs/glossary/types#chain)

The chain to add to the wallet.

## JSON-RPC Methods

[`eth_addEthereumChain`](https://eips.ethereum.org/EIPS/eip-3085)
