# getChainId

Returns the chain ID associated with the current network

## Import

```ts
import { getChainId } from 'viem/public'
```

## Usage

```ts
import { getChainId } from 'viem/public'
import { publicClient } from '.'
 
const block = await getChainId(publicClient) // [!code focus:99]
// 1
```

## Returns

`number`

The current chain ID.
