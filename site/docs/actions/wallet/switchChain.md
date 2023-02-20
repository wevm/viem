# switchChain

Switch the target chain in a wallet.

## Usage

```ts
import { avalanche } from 'viem/chains'
import { walletClient } from '.'
 
await walletClient.switchChain({ id: avalanche.id }) // [!code focus]
```

## Parameters

### id

- **Type:** `number`

The Chain ID.

