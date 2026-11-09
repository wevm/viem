---
description: Iterates over the event logs in a block range, one page of blocks at a time.
---

# iterateLogs

Iterates over the **event** logs in a block range, one page of blocks at a time.

Use `iterateLogs` to read logs across more blocks than an RPC Provider allows in one [`getLogs`](/docs/actions/public/getLogs) call, such as when backfilling event history.

## Usage

Each page contains the logs from `fromBlock` to `toBlock`. Pages are contiguous and are yielded even when they contain no logs.

:::code-group

```ts twoslash [example.ts]
import { parseAbiItem } from 'viem'
import { publicClient } from './client'

for await (const page of publicClient.iterateLogs({ // [!code focus:99]
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)'),
  fromBlock: 16330000n,
  toBlock: 16340000n,
})) {
  console.log(page)
  // @log: { fromBlock: 16330000n, toBlock: 16330999n, endBlock: 16340000n, logs: [{ ... }, { ... }] }
}
```

```ts twoslash [client.ts] filename="client.ts"
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
})
```

:::

### Resuming

A page is only requested once the previous one has been consumed, and a page that fails is never yielded. Store each page's `toBlock` along with its logs, and resume from `toBlock + 1n`.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
declare function getCursor(): Promise<bigint>
declare function save(logs: unknown[], toBlock: bigint, endBlock: bigint): Promise<void>
// ---cut---
import { parseAbiItem } from 'viem'

for await (const page of publicClient.iterateLogs({
  event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)'),
  fromBlock: (await getCursor()) + 1n, // [!code focus]
  toBlock: 16340000n,
})) {
  await save(page.logs, page.toBlock, page.endBlock) // [!code focus]
}
```

:::tip
When `toBlock` is a block tag, it is resolved to a block number once, before the first page. Pass the resolved `endBlock` as `toBlock` when resuming so the iteration keeps the same end.
:::

### Block Range Limits

Pages span `blockRange` blocks. If a request fails with an error that a smaller block range may avoid (such as an RPC Provider's block range or response size limit), the page is halved and requested again. Network, authorization and rate limit errors are thrown instead.

## Return Value

`AsyncGenerator<{ endBlock: bigint; fromBlock: bigint; logs: Log[]; toBlock: bigint }>`

An async iterator of pages. `endBlock` is the last block of the whole iteration, and each page's `logs` are typed the same as [`getLogs`](/docs/actions/public/getLogs#returns).

## Parameters

### address

- **Type:** [`Address | Address[]`](/docs/glossary/types#address)

A contract address or a list of contract addresses. Only logs originating from the contract(s) will be included.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const pages = publicClient.iterateLogs({
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // [!code focus]
  fromBlock: 16330000n,
})
```

### args

- **Type:** Inferred.

A list of _indexed_ event arguments.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
import { parseAbiItem } from 'viem'

const pages = publicClient.iterateLogs({
  event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)'),
  args: { // [!code focus:3]
    from: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
  },
  fromBlock: 16330000n,
})
```

### blockRange

- **Type:** `bigint`
- **Default:** `1_000n`

Most blocks to request in one `eth_getLogs` call. Must be at least `1n`.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const pages = publicClient.iterateLogs({
  blockRange: 2_000n, // [!code focus]
  fromBlock: 16330000n,
})
```

### event

- **Type:** [`AbiEvent`](/docs/glossary/types#abievent)

The event in ABI format.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
import { parseAbiItem } from 'viem'

const pages = publicClient.iterateLogs({
  event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)'), // [!code focus]
  fromBlock: 16330000n,
})
```

### events

- **Type:** [`AbiEvent[]`](/docs/glossary/types#abievent)

A list of events in ABI format.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
import { parseAbi } from 'viem'

const pages = publicClient.iterateLogs({
  events: parseAbi([ // [!code focus:4]
    'event Approval(address indexed owner, address indexed sender, uint256 value)',
    'event Transfer(address indexed from, address indexed to, uint256 value)',
  ]),
  fromBlock: 16330000n,
})
```

### fromBlock

- **Type:** `bigint`

First block to include logs from. Inclusive.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const pages = publicClient.iterateLogs({
  fromBlock: 16330000n, // [!code focus]
})
```

### strict

- **Type:** `boolean`
- **Default:** `false`

Whether or not the logs must match the indexed and non-indexed arguments of the `event`. See [`getLogs`](/docs/actions/public/getLogs#strict-mode).

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
import { parseAbiItem } from 'viem'

const pages = publicClient.iterateLogs({
  event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)'),
  fromBlock: 16330000n,
  strict: true, // [!code focus]
})
```

### toBlock

- **Type:** `bigint | 'latest' | 'earliest' | 'safe' | 'finalized'`
- **Default:** `'latest'`

Last block to include logs from. Inclusive. A block tag is resolved to a block number once, before the first page.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const pages = publicClient.iterateLogs({
  fromBlock: 16330000n,
  toBlock: 16340000n, // [!code focus]
})
```

## JSON-RPC Methods

- [`eth_getLogs`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getlogs)
- [`eth_getBlockByNumber`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getblockbynumber), when `toBlock` is a block tag.
