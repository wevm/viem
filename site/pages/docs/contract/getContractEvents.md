---
description: Returns a list of event logs matching the provided parameters. 
---

# getContractEvents

Returns a list of contract **event logs** matching the provided parameters.

## Usage

By default, `getContractEvents` returns all matched events on the ABI. In practice, you must use scoping to filter for specific events.

:::code-group

```ts [example.ts]
import { publicClient } from './client'
import { erc20Abi } from './abi'

// Fetch event logs for every event on every ERC-20 contract. // [!code focus:99]
const logs = await publicClient.getContractEvents({ 
  abi: erc20Abi 
})
// [{ ... }, { ... }, { ... }]
```

```ts [abi.ts]
export const erc20Abi = [
  ...
  {
    type: 'event',
    name: 'Transfer',
    inputs: [
      {
        indexed: true,
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        name: 'value',
        type: 'uint256',
      },
    ],
  }
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

You can also scope to a set of given attributes.

:::code-group

```ts [example.ts]
import { parseAbiItem } from 'viem'
import { publicClient } from './client'
import { erc20Abi } from './abi'

const usdcContractAddress = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' // [!code focus:99]

const logs = await publicClient.getContractEvents({ 
  address: usdcContractAddress,
  abi: erc20Abi,
  eventName: 'Transfer',
  args: {
    from: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
    to: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac'
  },
  fromBlock: 16330000n,
  toBlock: 16330050n
})
```

```ts [abi.ts]
export const erc20Abi = [
  ...
  {
    type: 'event',
    name: 'Transfer',
    inputs: [
      {
        indexed: true,
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        name: 'value',
        type: 'uint256',
      },
    ],
  }
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

### Address

Logs can be scoped to an **address**:

:::code-group

```ts [example.ts]
import { publicClient } from './client'
import { erc20Abi } from './abi'

const logs = await publicClient.getContractEvents({
  abi: erc20Abi,
  address: '0xfba3912ca04dd458c843e2ee08967fc04f3579c2', // [!code focus]
})
```

```ts [abi.ts]
export const erc20Abi = [
  ...
  {
    type: 'event',
    name: 'Transfer',
    inputs: [
      {
        indexed: true,
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        name: 'value',
        type: 'uint256',
      },
    ],
  }
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

### Event

Logs can be scoped to an **event**.

:::code-group

```ts [example.ts]
import { parseAbiItem } from 'viem' // [!code focus]
import { publicClient } from './client'
import { erc20Abi } from './abi'

const logs = await publicClient.getContractEvents({
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  abi: erc20Abi,
  eventName: 'Transfer', // [!code focus]
})
```

```ts [abi.ts]
export const erc20Abi = [
  ...
  {
    type: 'event',
    name: 'Transfer',
    inputs: [
      {
        indexed: true,
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        name: 'value',
        type: 'uint256',
      },
    ],
  }
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

### Arguments

Logs can be scoped to given **_indexed_ arguments**:

```ts
const logs = await publicClient.getContractEvents({
  abi: erc20Abi,
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  eventName: 'Transfer',
  args: { // [!code focus:4]
    from: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
    to: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac'
  }
})
```

Only indexed arguments in `event` are candidates for `args`.

An argument can also be an array to indicate that other values can exist in the position:

```ts
const logs = await publicClient.getContractEvents({
  abi: erc20Abi,
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
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

Logs can be scoped to a **block range**:

```ts
const logs = await publicClient.getContractEvents({
  abi: erc20Abi,
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  eventName: 'Transfer',
  fromBlock: 16330000n, // [!code focus]
  toBlock: 16330050n // [!code focus]
})
```

### Strict Mode

By default, `getContractEvents` will include logs that [do not conform](/docs/glossary/terms#non-conforming-log) to the indexed & non-indexed arguments on the `event`.
viem will not return a value for arguments that do not conform to the ABI, thus, some arguments on `args` may be undefined.

```ts
const logs = await publicClient.getContractEvents({
  abi: erc20Abi,
  eventName: 'Transfer',
})

logs[0].args // [!code focus]
//      ^? { address?: Address, to?: Address, value?: bigint } // [!code focus]
```

You can turn on `strict` mode to only return logs that conform to the indexed & non-indexed arguments on the `event`, meaning that `args` will always be defined. The trade-off is that non-conforming logs will be filtered out.

```ts 
const logs = await publicClient.getContractEvents({
  abi: erc20Abi,
  eventName: 'Transfer',
  strict: true
})

logs[0].args // [!code focus]
//      ^? { address: Address, to: Address, value: bigint } // [!code focus]
```

## Returns

[`Log[]`](/docs/glossary/types#log)

A list of event logs.

## Parameters

### abi

- **Type:** [`Abi`](/docs/glossary/types#abi)

The contract's ABI.

```ts
const logs = await publicClient.getContractEvents({
  abi: erc20Abi, // [!code focus]
})
```

### address

- **Type:** [`Address | Address[]`](/docs/glossary/types#address)

A contract address or a list of contract addresses. Only logs originating from the contract(s) will be included in the result.

```ts
const logs = await publicClient.getContractEvents({
  abi: erc20Abi,
  address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', // [!code focus]
})
```

### eventName

- **Type:** `string`

An event name on the `abi`.

```ts
const logs = await publicClient.getContractEvents({
  abi: erc20Abi,
  eventName: 'Transfer' // [!code focus]
})
```

### args

- **Type:** Inferred.

A list of _indexed_ event arguments.

```ts
const logs = await publicClient.getContractEvents({
  abi: erc20Abi,
  eventName: 'Transfer',
  args: { // [!code focus:4]
    from: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
    to: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac'
  },
})
```

### fromBlock

- **Type:** `bigint | 'latest' | 'earliest' | 'pending' | 'safe' | 'finalized'`

Block to start including logs from. Mutually exclusive with `blockHash`.

```ts
const filter = await publicClient.getContractEvents({
  abi: erc20Abi,
  fromBlock: 69420n // [!code focus]
})
```

### toBlock

- **Type:** `bigint | 'latest' | 'earliest' | 'pending' | 'safe' | 'finalized'`

Block to stop including logs from. Mutually exclusive with `blockHash`.

```ts
const filter = await publicClient.getContractEvents({
  abi: erc20Abi,
  toBlock: 70120n // [!code focus]
})
```

### blockHash

- **Type:** `'0x${string}'`

Block hash to include logs from. Mutually exclusive with `fromBlock`/`toBlock`.

```ts
const logs = await publicClient.getContractEvents({
  abi: erc20Abi,
  blockHash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d' // [!code focus]
})
```

## JSON-RPC Method

[`eth_getLogs`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getLogs)
