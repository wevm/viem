# switchChain

Switch the target chain in a wallet.

## Usage

```ts
import { switchChain } from 'viem/wallet'
```

## Usage

```ts
import { switchChain } from 'viem/wallet'
import { avalanche } from 'viem/chains'
import { walletClient } from '.'
 
await switchChain(walletClient, { id: avalanche.id }) // [!code focus]
```

## Parameters

### id

- **Type:** `number`

The Chain ID.

