---
description: Adds an EVM chain to the wallet.
---

# addChain

Adds an EVM chain to the wallet.

## Usage

:::code-group

```ts twoslash [example.ts]
import { avalanche } from 'viem/chains'
import { walletClient } from './client'
 
await walletClient.addChain({ chain: avalanche }) // [!code focus]
```

```ts twoslash [client.ts] filename="client.ts"
// [!include ~/snippets/walletClient.ts]
```

:::

## Parameters

### chain

- **Type:** [`Chain`](/docs/glossary/types#chain)

The chain to add to the wallet.

## JSON-RPC Methods

[`wallet_addEtherereumChain`](https://eips.ethereum.org/EIPS/eip-3085)
