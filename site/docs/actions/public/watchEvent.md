# watchEvent

Watches and returns emitted [Event Logs](/docs/glossary/terms#TODO).

This Action will batch up all the Event Logs found within the [`pollingInterval`](#pollinginterval-optional), and invoke them via [`onLogs`](#onLogs).

`watchEvent` will attempt to create an [Event Filter](/docs/actions/public/watchEvent) and listen to changes to the Filter per polling interval, however, if the RPC Provider does not support Filters (ie. `eth_newFilter`), then `watchEvent` will fall back to using [`getLogs`](/docs/actions/public/getLogs) instead.

## Usage

By default, you can watch all broadcasted events to the blockchain by just passing `onLogs`. 

These events will be batched up into [Event Logs](/docs/glossary/terms#TODO) and sent to `onLogs`:

::: code-group

```ts [example.ts]
import { publicClient } from './client'
import { wagmiAbi } from './abi'

const unwatch = await publicClient.watchEvent({
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

## Scoping

You can also scope `watchEvent` to a set of given attributes (listed below).

### Address

`watchEvent` can be scoped to an **address**:

::: code-group

```ts [example.ts]
import { publicClient } from './client'
import { wagmiAbi } from './abi'

const unwatch = await publicClient.watchEvent({
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // [!code focus]
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

### Event

`watchEvent` can be scoped to an **event**.

The `event` argument takes in an event in ABI format – we have a [`parseAbiEvent` utility](/docs/contract/parseAbiEvent) that you can use to convert from a human-readable event signature → ABI.

::: code-group

```ts [example.ts]
import { parseAbiEvent } from 'viem' // [!code focus]
import { publicClient } from './client'
import { wagmiAbi } from './abi'

const unwatch = await publicClient.watchEvent({
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  event: parseAbiEvent('Transfer(address indexed from, address indexed to, uint256 value)'), // [!code focus]
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

By default, `event` accepts the [`AbiEvent`] type:

```ts
import { watchEvent } from 'viem/public'
import { parseAbiEvent } from 'viem/utils' // [!code focus]
import { publicClient } from '.'

const unwatch = await watchEvent(publicClient, {
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  event: { // [!code focus:8]
    name: 'Transfer', 
    inputs: [
      { type: 'address', indexed: true, name: 'from' },
      { type: 'address', indexed: true, name: 'to' },
      { type: 'uint256', indexed: false, name: 'value' }
    ] 
  },
  onLogs: logs => console.log(logs)
})
```

### Arguments

`watchEvents` can be scoped to given **_indexed_ arguments** on the event:

::: code-group

```ts [example.ts]
import { parseAbiEvent } from 'viem'
import { publicClient } from './client'
import { wagmiAbi } from './abi'

const unwatch = await publicClient.watchEvent({
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  event: parseAbiEvent('Transfer(address indexed from, address indexed to, uint256 value)'),
  args: { // [!code focus:4]
    from: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
    to: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac'
  },
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

Only indexed arguments in `event` are candidates for `args`.

These arguments can also be an array to indicate that other values can exist in the position:

```ts
const unwatch = await publicClient.watchEvent({
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  event: parseAbiEvent('Transfer(address indexed from, address indexed to, uint256 value)'),
  args: { // [!code focus:8]
    // '0xd8da...' OR '0xa5cc...' OR '0xa152...'
    from: [
      '0xd8da6bf26964af9d7eed9e03e53415d37aa96045', 
      '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac',
      '0xa152f8bb749c55e9943a3a0a3111d18ee2b3f94e',
    ],
  }
  onLogs: logs => console.log(logs)
})
```

## Returns

`UnwatchFn`

A function that can be invoked to stop watching for new Event Logs.

## Parameters

### onLogs

- **Type:** `(logs: Log[]) => void`

The new Event Logs.

```ts
const unwatch = publicClient.watchEvent(
  { onLogs: logs => console.log(logs) } // [!code focus:1]
)
```

### address (optional)

- **Type:** `Address | Address[]`

The contract address or a list of addresses from which Logs should originate.

```ts
const unwatch = publicClient.watchEvent(
  { 
    address: '0xfba3912ca04dd458c843e2ee08967fc04f3579c2', // [!code focus]
    onLogs: logs => console.log(logs) 
  }
)
```

### event (optional)

- **Type:** [`AbiEvent`](/docs/glossary/types#TODO)

The event in ABI format.

A [`parseAbiEvent` utility](/docs/contract/parseAbiEvent) is exported from viem that converts from a human-readable event signature → ABI.

```ts
import { parseAbiEvent } from 'viem' // [!code focus]

const unwatch = publicClient.watchEvent(
  { 
    address: '0xfba3912ca04dd458c843e2ee08967fc04f3579c2',
    event: parseAbiEvent('Transfer(address indexed from, address indexed to, uint256 value)'), // [!code focus]
    onLogs: logs => console.log(logs) 
  }
)
```

### args (optional)

- **Type:** Inferred.

A list of _indexed_ event arguments.

```ts
const unwatch = publicClient.watchEvent(
  { 
    address: '0xfba3912ca04dd458c843e2ee08967fc04f3579c2',
    event: parseAbiEvent('Transfer(address indexed from, address indexed to, uint256 value)'),
    args: { // [!code focus:4]
     from: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
      to: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac'
    }
    onLogs: logs => console.log(logs) 
  }
)
```
### batch (optional)

- **Type:** `boolean`
- **Default:** `true`

Whether or not to batch the Event Logs between polling intervals.

```ts
const unwatch = publicClient.watchEvent(
  { 
    batch: false, // [!code focus]
    onLogs: logs => console.log(logs),
  }
)
```

### onError (optional)

- **Type:** `(error: Error) => void`

Error thrown from listening for new Event Logs.

```ts
const unwatch = publicClient.watchEvent(
  { 
    onError: error => console.log(error) // [!code focus:1]
    onLogs: logs => console.log(logs),
  }
)
```

### pollingInterval (optional)

- **Type:** `number`

Polling frequency (in ms). Defaults to the Client's `pollingInterval` config.

```ts
const unwatch = publicClient.watchEvent(
  { 
    pollingInterval: 1_000, // [!code focus]
    onLogs: logs => console.log(logs),
  }
)
```

## Live Example

Check out the usage of `watchEvent` in the live [Event Logs Example](https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/filters-and-logs/event-logs) below.

<iframe frameborder="0" width="100%" height="500px" src="https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/filters-and-logs/event-logs?embed=1&file=index.ts&hideNavigation=1&hideDevTools=true&terminalHeight=0"></iframe>
