# getBlock

Returns information about a block at a block number, hash or tag.

## Usage

```ts
import { publicClient } from '.'
 
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

## Returns

[`Block`](/docs/glossary/types#TODO)

Information about the block.

## Parameters

### blockHash (optional)

- **Type:** `'0x${string}'`

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

## Example

Check out the usage of `getBlock` in the live [Fetching Blocks Example](https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/blocks/fetching-blocks) below.

<!-- TODO: Replace before launch: <iframe frameborder="0" width="100%" height="500px" src="https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/blocks/fetching-blocks?embed=1&file=index.ts&hideNavigation=1&hideDevTools=true&terminalHeight=0"></iframe> -->
<iframe frameborder="0" width="100%" height="500px" src="https://stackblitz.com/edit/viem-fetching-blocks?embed=1&file=index.ts&hideNavigation=1&hideDevTools=true&terminalHeight=0"></iframe>