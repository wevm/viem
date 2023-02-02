# getLogs

Returns a list of **event** logs matching the provided parameters. 

## Import

```ts
import { getLogs } from 'viem'
```

## Usage

```ts
import { getLogs } from 'viem'
import { publicClient } from '.'

const logs = await getLogs(publicClient, { address, topics, fromBlock, toBlock })
// [{ ... }, { ... }, { ... }]
```

## Returns

[`Log[]`](/docs/glossary/types#TODO)

A list of event logs.

## Parameters

### address

- **Type:** [`Address | Address[]`](/docs/glossary/types#TODO)

A contract address or a list of contract addresses. Only logs originating from the contract(s) will be included in the result.

```ts
const logs = await getLogs(publicClient, {
  address, // [!code focus]
})
```

### topics

- **Type:** [`Hex[]`](/docs/glossary/types#TODO)

An order-dependent list of topics.

```ts
const logs = await getLogs(publicClient, {
  topics, // [!code focus]
})
```


### fromBlock/toBlock

- **Type:** [`bigint | 'latest' | 'earliest' | 'pending' | 'safe' | 'finalized'`](/docs/glossary/types#TODO)

Block numbers or tags to limit the list of returned logs to a range of blocks. Mutually exclusive with `blockHash`.

```ts
const logs = await getLogs(publicClient, {
  fromBlock, // [!code focus]
  toBlock, // [!code focus]
})
```

### blockHash

- **Type:** [`bigint | 'latest' | 'earliest' | 'pending' | 'safe' | 'finalized'`](/docs/glossary/types#TODO)

Block number or tag to include logs from. Mutually exclusive with `fromBlock`/`toBlock`.

```ts
const logs = await getLogs(publicClient, {
  blockHash, // [!code focus]
})
```