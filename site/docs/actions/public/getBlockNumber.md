# getBlockNumber

Returns the number of the most recent block seen.

## Usage

```ts
import { publicClient } from '.'
 
const block = await publicClient.getBlockNumber() // [!code focus:99]
// 69420n
```

## Returns

`bigint`

The number of the block.

## Parameters

### maxAge (optional)

- **Type:** `number`
- **Default:** [Client's `pollingInterval`](/docs/clients/public#pollinginterval-optional)

The maximum age (in ms) of the cached value. 

```ts
const block = await publicClient.getBlockNumber({
  maxAge: 4_000 // [!code focus]
})
```

By default, block numbers are cached for the period of the [Client's `pollingInterval`](/TODO). 

- Setting a value of above zero will make block number remain in the cache for that period.
- Setting a value of `0` will disable the cache, and always retrieve a fresh block number.



## Example

<iframe frameborder="0" width="100%" height="500px" src="https://replit.com/@jxom/getBlockNumber?embed=true"></iframe>