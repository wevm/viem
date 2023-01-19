# addChain

Adds an EVM chain to the wallet.

## Usage

```ts
import { addChain } from 'viem'
```

## Usage

```ts
import { addChain } from 'viem'
import { avalanche } from 'viem/chains'
import { walletClient } from '.'
 
await addChain(walletClient, avalanche) // [!code focus]
```

## Arguments

### chain

- **Type:** [`Chain`](/docs/glossary/types#TODO)

The chain to add to the wallet.

