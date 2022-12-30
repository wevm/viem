# switchChain

Switch the target chain in a wallet.

## Usage

```ts
import { switchChain } from 'viem'
```

## Usage

```ts
import { switchChain } from 'viem'
import { avalanche } from 'viem/chains'
import { walletClient } from '.'
 
await switchChain(walletClient, { id: avalanche.id }) // [!code focus]
```

## Arguments

### id

- **Type:** `number`

The Chain ID.

## Example

<iframe frameborder="0" width="100%" height="500px" src="https://replit.com/@jxom/TODO"></iframe>

