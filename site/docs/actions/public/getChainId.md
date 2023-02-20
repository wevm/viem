# getChainId

Returns the chain ID associated with the current network

## Usage

```ts
import { publicClient } from '.'
 
const block = await publicClient.getChainId() // [!code focus:99]
// 1
```

## Returns

`number`

The current chain ID.
