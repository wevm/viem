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

const logs = await getLogs(publicClient, {
  address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  topics: ['0xd8da6bf26964af9d7eed9e03e53415d37aa96045', '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac'],
  fromBlock: 16330000n,
  toBlock: 16330050n
})
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
  address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', // [!code focus]
  topics: ['0xd8da6bf26964af9d7eed9e03e53415d37aa96045', '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac'],
  fromBlock: 16330000n,
  toBlock: 16330050n
})
```

### topics

- **Type:** [`('0x${string}' | '0x${string}'[])[]`](/docs/glossary/types#TODO)

An order-dependent list of topics.

```ts
const logs = await getLogs(publicClient, {
  address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  topics: ['0xd8da6bf26964af9d7eed9e03e53415d37aa96045', '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac'], // [!code focus]
  fromBlock: 16330000n,
  toBlock: 16330050n
})
```


### fromBlock/toBlock

- **Type:** [`bigint | 'latest' | 'earliest' | 'pending' | 'safe' | 'finalized'`](/docs/glossary/types#TODO)

Block numbers or tags to limit the list of returned logs to a range of blocks. Mutually exclusive with `blockHash`.

```ts
const logs = await getLogs(publicClient, {
  address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  topics: ['0xd8da6bf26964af9d7eed9e03e53415d37aa96045', '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac'],
  fromBlock: 16330000n, // [!code focus]
  toBlock: 16330050n // [!code focus]
})
```

### blockHash

- **Type:** `'0x${string}'`

Block hash to include logs from. Mutually exclusive with `fromBlock`/`toBlock`.

```ts
const logs = await getLogs(publicClient, {
  address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  topics: ['0xd8da6bf26964af9d7eed9e03e53415d37aa96045', '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac'],
  blockHash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d' // [!code focus]
})
```