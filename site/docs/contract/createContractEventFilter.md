# createContractEventFilter

Creates a Filter to retrieve event logs that can be used with [`getFilterChanges`](/docs/actions/public/getFilterChanges) or [`getFilterLogs`](/docs/actions/public/getFilterChanges).

## Usage

By default, an Event Filter with an ABI (`abi`) will retrieve events defined on the ABI.

::: code-group

```ts [example.ts]
import { publicClient } from './client'
import { wagmiAbi } from './abi'

const filter = await publicClient.createContractEventFilter({
  abi: wagmiAbi
})
/**
 *  {
 *    abi: [...],
 *    id: '0x345a6572337856574a76364e457a4366',
 *    type: 'event'
 *  }
 */
```

```ts [abi.ts]
export const wagmiAbi = [
  ...
  {
    inputs: [
      {
        indexed: true,
        name: "from",
        type: "address",
      },
      { indexed: true, name: "to", type: "address" },
      {
        indexed: true,
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  ...
] as const;
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

## Scoping

You can also scope a Filter to a set of given attributes (listed below).

### Address

A Filter can be scoped to an **address**:

```ts 
const filter = await publicClient.createContractEventFilter({
  abi: wagmiAbi,
  address: '0xfba3912ca04dd458c843e2ee08967fc04f3579c2' // [!code focus]
})
```

### Event

A Filter can be scoped to an **event**:

```ts
const filter = await publicClient.createContractEventFilter({
  abi: wagmiAbi,
  address: '0xfba3912ca04dd458c843e2ee08967fc04f3579c2',
  eventName: 'Transfer' // [!code focus]
})
```

### Arguments

A Filter can be scoped to given **_indexed_ arguments**:

```ts
const filter = await publicClient.createContractEventFilter({
  abi: wagmiAbi,
  address: '0xfba3912ca04dd458c843e2ee08967fc04f3579c2',
  eventName: 'Transfer',
  args: {  // [!code focus:4]
    from: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
    to: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac'
  }
})
```

Only indexed arguments in `event` are candidates for `args`.

A Filter Argument can also be an array to indicate that other values can exist in the position:

```ts
const filter = await publicClient.createContractEventFilter({
  abi: wagmiAbi,
  address: '0xfba3912ca04dd458c843e2ee08967fc04f3579c2',
  eventName: 'Transfer',
  args: { // [!code focus:8]
    // '0xd8da...' OR '0xa5cc...' OR '0xa152...'
    from: [
      '0xd8da6bf26964af9d7eed9e03e53415d37aa96045', 
      '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac',
      '0xa152f8bb749c55e9943a3a0a3111d18ee2b3f94e',
    ],
  }
})
```

### Block Range

A Filter can be scoped to a **block range**:

```ts
const filter = await publicClient.createContractEventFilter({
  abi: wagmiAbi,
  address: '0xfba3912ca04dd458c843e2ee08967fc04f3579c2',
  eventName: 'Transfer',
  fromBlock: 16330000n, // [!code focus]
  toBlock: 16330050n // [!code focus]
})
```

## Returns

[`Filter`](/docs/glossary/types#TODO)

## Parameters

### abi

- **Type:** [`Abi`](/docs/glossary/types#TODO)

The contract's ABI.

```ts
const filter = await publicClient.createContractEventFilter({
  abi: wagmiAbi, // [!code focus]
})
```

### address (optional)

- **Type:** `Address | Address[]`

The contract address or a list of addresses from which Logs should originate. If no addresses are provided, then it will query all events matching the event signatures on the ABI.

```ts
const filter = await publicClient.createContractEventFilter({
  abi: wagmiAbi,
  address: '0xfba3912ca04dd458c843e2ee08967fc04f3579c2' // [!code focus]
})
```

### eventName (optional)

- **Type:** `string`

The event name.

```ts
const filter = await publicClient.createContractEventFilter({
  abi: wagmiAbi,
  eventName: 'Transfer' // [!code focus]
})
```

### args (optional)

- **Type:** Inferred.

A list of _indexed_ event arguments.

```ts
const filter = await publicClient.createContractEventFilter({
  abi: wagmiAbi,
  eventName: 'Transfer',
  args: { // [!code focus:4]
    from: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
    to: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac'
  }
})
```

### fromBlock (optional)

- **Type:** `bigint`

Block to start querying/listening from.

```ts
const filter = await publicClient.createContractEventFilter({
  abi: wagmiAbi,
  fromBlock: 69420n // [!code focus]
})
```

### toBlock (optional)

- **Type:** `bigint`

Block to query/listen until.

```ts
const filter = await publicClient.createContractEventFilter({
  abi: wagmiAbi,
  fromBlock: 70120n // [!code focus]
})
```