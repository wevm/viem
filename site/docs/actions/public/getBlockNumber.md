---
head:
  - - meta
    - property: og:title
      content: getBlockNumber
  - - meta
    - name: description
      content: Returns the number of the most recent block seen.
  - - meta
    - property: og:description
      content: Returns the number of the most recent block seen.

---

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

By default, block numbers are cached for the period of the [Client's `pollingInterval`](/docs/clients/public#pollinginterval-optional).

- Setting a value of above zero will make block number remain in the cache for that period.
- Setting a value of `0` will disable the cache, and always retrieve a fresh block number.



## Example

Check out the usage of `getBlockNumber` in the live [Fetching Blocks Example](https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/blocks/fetching-blocks) below.

<iframe frameborder="0" width="100%" height="500px" src="https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/blocks/fetching-blocks?embed=1&file=index.ts&hideNavigation=1&hideDevTools=true&terminalHeight=0"></iframe>
