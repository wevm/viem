# fetchBlockNumber

Returns the number of the most recent block seen.

## Import

```ts
import { fetchBlockNumber } from 'viem'
```

## Usage

```ts
import { fetchBlockNumber } from 'viem'
import { publicClient } from '.'
 
const block = await fetchBlockNumber(publicClient) // [!code focus:99]
// 69420n
```

## Returns

`bigint`

The number of the block.

## Example

<iframe frameborder="0" width="100%" height="500px" src="https://replit.com/@jxom/fetchBlockNumber?embed=true"></iframe>