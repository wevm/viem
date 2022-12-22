# getBlockNumber

Returns the number of the most recent block seen.

## Import

```ts
import { getBlockNumber } from 'viem'
```

## Usage

```ts
import { getBlockNumber } from 'viem'
import { publicClient } from '.'
 
const block = await getBlockNumber(publicClient) // [!code focus:99]
// 69420n
```

## Returns

`bigint`

The number of the block.

## Example

<iframe frameborder="0" width="100%" height="500px" src="https://replit.com/@jxom/getBlockNumber?embed=true"></iframe>