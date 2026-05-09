---
description: Watches and returns pending transaction hashes.
---

# watchPendingTransactions

Watches and returns pending transaction hashes.

This Action will batch up all the pending transactions found within the [`pollingInterval`](#pollinginterval-optional), and invoke them via [`onTransactions`](#ontransactions).


## Usage

:::code-group

```ts twoslash [example.ts]
import { publicClient } from './client'

const unwatch = publicClient.watchPendingTransactions( // [!code focus:99]
  { onTransactions: hashes => console.log(hashes) }
)
// @log: > ['0x...', '0x...', '0x...']
// @log: > ['0x...', '0x...']
// @log: > ['0x...', '0x...', '0x...', ...]
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

## Returns

`UnwatchFn`

A function that can be invoked to stop watching for new pending transaction hashes.

## Parameters

### onTransactions

- **Type:** `(hashes: '0x${string}'[]) => void`

The new pending transaction hashes.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const unwatch = publicClient.watchPendingTransactions(
  { onTransactions: hashes => console.log(hashes) } // [!code focus:1]
)
```

### batch (optional)

- **Type:** `boolean`
- **Default:** `true`

Whether or not to batch the transaction hashes between polling intervals.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const unwatch = publicClient.watchPendingTransactions(
  { 
    batch: false, // [!code focus]
    onTransactions: hashes => console.log(hashes),
  }
)
```

### onError (optional)

- **Type:** `(error: Error) => void`

Error thrown from listening for new pending transactions.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
// @noErrors
const unwatch = publicClient.watchPendingTransactions(
  { 
    onError: error => console.log(error), // [!code focus:1]
    onTransactions: hashes => console.log(hashes),
  }
)
```

### poll (optional)

- **Type:** `boolean`
- **Default:** `false` for WebSocket Clients, `true` for non-WebSocket Clients

Whether or not to use a polling mechanism to check for new pending transactions instead of a WebSocket subscription.

This option is only configurable for Clients with a [WebSocket Transport](/docs/clients/transports/websocket).

```ts twoslash
import { createPublicClient, webSocket } from 'viem'
import { mainnet } from 'viem/chains'

const publicClient = createPublicClient({
  chain: mainnet,
  transport: webSocket()
})

const unwatch = publicClient.watchPendingTransactions(
  { 
    onTransactions: transactions => console.log(transactions),
    poll: true, // [!code focus]
  }
)
```

### pollingInterval (optional)

- **Type:** `number`

Polling frequency (in ms). Defaults to the Client's `pollingInterval` config.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
// @noErrors
const unwatch = publicClient.watchPendingTransactions(
  { 
    pollingInterval: 1_000, // [!code focus]
    onTransactions: hashes => console.log(hashes),
  }
)
```

## JSON-RPC Methods

- When `poll: true`
  - Calls [`eth_newPendingTransactionFilter`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_newpendingtransactionfilter) to initialize the filter.
  - Calls [`eth_getFilterChanges`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getFilterChanges) on a polling interval.
- When `poll: false` & WebSocket Transport, uses a WebSocket subscription via [`eth_subscribe`](https://docs.alchemy.com/reference/eth-subscribe-polygon) and the `"newPendingTransactions"` event. 