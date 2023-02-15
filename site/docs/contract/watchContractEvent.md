# watchContractEvent

Watches and returns emitted contract event logs.

This Action will batch up all the event logs found within the [`pollingInterval`](#pollinginterval-optional), and invoke them via [`onLogs`](#onLogs).

## Import

```ts
import { watchContractEvent } from 'viem/contract'
```

## Usage

::: code-group

```ts [example.ts]
import { watchContractEvent } from 'viem/contract'
import { publicClient } from './client'
import { wagmiAbi } from './abi'

const unwatch = await watchContractEvent(publicClient, {
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  onLogs: logs => console.log(logs)
})
// > [{ ... }, { ... }, { ... }]
// > [{ ... }, { ... }]
// > [{ ... }, { ... }, { ... }, { ... }]
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

### Scoping to an Event Name

You can scope to an event on the given ABI.

::: code-group

```ts {8} [example.ts]
import { watchContractEvent } from 'viem/contract'
import { publicClient } from './client'
import { wagmiAbi } from './abi'

const unwatch = await watchContractEvent(publicClient, {
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  eventName: 'Transfer',
  onLogs: logs => console.log(logs)
})
// > [{ ... }, { ... }, { ... }]
// > [{ ... }, { ... }]
// > [{ ... }, { ... }, { ... }, { ... }]
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

### Scoping to Event Arguments

You can scope to given **indexed event arguments**.

In the example below, we want to filter out `Transfer`s that were sent by the address `"0xc961145a54C96E3aE9bAA048c4F4D6b04C13916b"`.

> Only **`indexed`** arguments on the event ABI are candidates for `args` (see `abi.ts`).

::: code-group

```ts {8-9} [example.ts]
import { watchContractEvent } from 'viem/contract'
import { publicClient } from './client'
import { wagmiAbi } from './abi'

const unwatch = await watchContractEvent(publicClient, {
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  eventName: 'Transfer',
  args: { from: '0xc961145a54C96E3aE9bAA048c4F4D6b04C13916b' },
  onLogs: logs => console.log(logs)
})
// > [{ ... }, { ... }, { ... }]
// > [{ ... }, { ... }]
// > [{ ... }, { ... }, { ... }, { ... }]
```

```ts {6-8} [abi.ts]
export const wagmiAbi = [
  ...
  {
    inputs: [
      {
        indexed: true,
        name: "from",
        type: "address",
      },
      { 
        indexed: true, 
        name: "to", 
        type: "address" 
      },
      {
        indexed: false,
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

## Returns

`UnwatchFn`

A function that can be invoked to stop watching for new event logs.

## Arguments

### abi

- **Type:** [`Abi`](/docs/glossary/types#TODO)

The contract's ABI.

```ts
const unwatch = await watchContractEvent(publicClient, {
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi, // [!code focus]
  onLogs: logs => console.log(logs)
})
```

### onLogs

- **Type:** `(Log[]) => void`

The new event logs.

```ts
const unwatch = await watchContractEvent(publicClient, {
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  onLogs: logs => console.log(logs) // [!code focus]
})
```

### address (optional)

- **Type:** `Address`

The contract address. If no address is provided, then it will emit all events matching the event signatures on the ABI.

```ts
const unwatch = await watchContractEvent(publicClient, {
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2', // [!code focus]
  abi: wagmiAbi,
  onLogs: logs => console.log(logs)
})
```

### args (optional)

- **Type:** Inferred from ABI.

Event arguments to filter logs.

```ts
const unwatch = await watchContractEvent(publicClient, {
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  eventName: 'Transfer', // [!code focus]
  args: ['0xc961145a54C96E3aE9bAA048c4F4D6b04C13916b'], // [!code focus]
  onLogs: logs => console.log(logs)
})
```

### eventName (optional)

- **Type:** `string`

An event name to filter logs.

```ts
const unwatch = await watchContractEvent(publicClient, {
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  eventName: 'Transfer', // [!code focus]
  onLogs: logs => console.log(logs)
})
```

### batch (optional)

- **Type:** `boolean`
- **Default:** `true`

Whether or not to batch logs between polling intervals.

```ts
const unwatch = await watchContractEvent(publicClient, {
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  batch: false, // [!code focus]
  onLogs: logs => console.log(logs)
})
```

### onError (optional)

- **Type:** `(error: Error) => void`

Error thrown from listening for new event logs.

```ts
const unwatch = await watchContractEvent(publicClient, {
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  onError: error => console.log(error), // [!code focus]
  onLogs: logs => console.log(logs)
})
```

### pollingInterval (optional)

- **Type:** `number`

Polling frequency (in ms). Defaults to the Client's `pollingInterval` config.

```ts
const unwatch = await watchContractEvent(publicClient, {
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  pollingInterval: 1_000, // [!code focus]
  onLogs: logs => console.log(logs)
})
```