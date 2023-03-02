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

```ts
import { avalanche } from 'viem/chains'
import { walletClient } from '.'
 
await walletClient.addChain(avalanche) // [!code focus]
```

## Parameters

### chain

- **Type:** [`Chain`](/docs/glossary/types#chain)

The chain to add to the wallet.

## JSON-RPC Methods

[`eth_addEthereumChain`](https://eips.ethereum.org/EIPS/eip-3085)
