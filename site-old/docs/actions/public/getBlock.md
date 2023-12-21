---
head:
  - - meta
    - property: og:title
      content: getBlock
  - - meta
    - name: description
      content: Returns information about a block at a block number, hash or tag.
  - - meta
    - property: og:description
      content: Returns information about a block at a block number, hash or tag.

---

# getBlock

Returns information about a block at a block number, hash or tag.

## Usage

::: code-group

```ts [example.ts]
import { publicClient } from './client'

const block = await publicClient.getBlock() // [!code focus:99]
/**
 * {
 *  baseFeePerGas: 10789405161n,
 *  difficulty: 11569232145203128n,
 *  extraData: '0x75732d656173742d38',
 *  ...
 * }
 */
```

```ts [client.ts]
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
})
```

:::

## Returns

[`Block`](/docs/glossary/types#block)

Information about the block.

## Parameters

### blockHash (optional)

- **Type:** [`Hash`](/docs/glossary/types#hash)

Information at a given block hash.

```ts
const block = await publicClient.getBlock({
  blockHash: '0x89644bbd5c8d682a2e9611170e6c1f02573d866d286f006cbf517eec7254ec2d' // [!code focus]
})
```

### blockNumber (optional)

- **Type:** `bigint`

Information at a given block number.

```ts
const block = await publicClient.getBlock({
  blockNumber: 42069n // [!code focus]
})
```

### blockTag (optional)

- **Type:** `'latest' | 'earliest' | 'pending' | 'safe' | 'finalized'`
- **Default:** `'latest'`

Information at a given block tag.

```ts
const block = await publicClient.getBlock({
  blockTag: 'safe' // [!code focus]
})
```

### includeTransactions (optional)

- **Type:** `boolean`

Whether or not to include transactions (as a structured array of `Transaction` objects).

```ts
const block = await publicClient.getBlock({
  includeTransactions: true // [!code focus]
})
```

## Example

Check out the usage of `getBlock` in the live [Fetching Blocks Example](https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/blocks_fetching-blocks) below.

<iframe frameborder="0" width="100%" height="500px" src="https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/blocks_fetching-blocks?embed=1&file=index.ts&hideNavigation=1&hideDevTools=true&terminalHeight=0&ctl=1"></iframe>

## JSON-RPC Method

- Calls [`eth_getBlockByNumber`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getblockbynumber) for `blockNumber` & `blockTag`.
- Calls [`eth_getBlockByHash`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getblockbyhash) for `blockHash`.
