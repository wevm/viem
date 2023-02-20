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

- **Type:** [`Chain`](/docs/glossary/types#TODO)

The chain to add to the wallet.

