---
head:
  - - meta
    - property: og:title
      content: switchChain
  - - meta
    - name: description
      content: Switch the target chain in a wallet.
  - - meta
    - property: og:description
      content: Switch the target chain in a wallet.

---

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

