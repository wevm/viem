---
description: Watches and returns incoming block numbers.
---

# watchBlockNumber

Watches and returns incoming block numbers.

## Usage

Pass through your Public Client, along with a listener.

:::code-group

```ts twoslash [example.ts]
import { publicClient } from './client'

const unwatch = publicClient.watchBlockNumber( // [!code focus:99]
  { onBlockNumber: blockNumber => console.log(blockNumber) }
)
// @log: > 69420n
// @log: > 69421n
// @log: > 69422n
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

## Listener

`(blockNumber: bigint) => void`

The block number.

## Returns

`UnwatchFn`

A function that can be invoked to stop watching for new block numbers.

## Parameters

### emitMissed (optional)

- **Type:** `boolean`
- **Default:** `false`

Whether or not to emit missed block numbers to the callback. 

Missed block numbers may occur in instances where internet connection is lost, or the block time is lesser than the [polling interval](/docs/clients/public#pollinginterval-optional) of the client.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const unwatch = publicClient.watchBlockNumber(
  { 
    emitMissed: true, // [!code focus]
    onBlockNumber: blockNumber => console.log(blockNumber),
  }
)
```

### emitOnBegin (optional)

- **Type:** `boolean`
- **Default:** `false`

Whether or not to emit the latest block number to the callback when the subscription opens.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const unwatch = publicClient.watchBlockNumber(
  { 
    emitOnBegin: true, // [!code focus]
    onBlockNumber: blockNumber => console.log(blockNumber),
  }
)
```

### poll (optional)

- **Type:** `boolean`
- **Default:** `false` for WebSocket Transports, `true` for non-WebSocket Transports

Whether or not to use a polling mechanism to check for new block numbers instead of a WebSocket subscription.

This option is only configurable for Clients with a [WebSocket Transport](/docs/clients/transports/websocket).

```ts twoslash
import { createPublicClient, webSocket } from 'viem'
import { mainnet } from 'viem/chains'

const publicClient = createPublicClient({
  chain: mainnet,
  transport: webSocket()
})

const unwatch = publicClient.watchBlockNumber(
  { 
    onBlockNumber: blockNumber => console.log(blockNumber),
    poll: true, // [!code focus]
  }
)
```

### pollingInterval (optional)

- **Type:** `number`

Polling frequency (in ms). Defaults to Client's `pollingInterval` config.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const unwatch = publicClient.watchBlockNumber(
  { 
    onBlockNumber: blockNumber => console.log(blockNumber),
    pollingInterval: 12_000, // [!code focus]
  }
)
```

## Example

Check out the usage of `watchBlockNumber` in the live [Watch Block Numbers Example](https://stackblitz.com/github/wevm/viem/tree/main/examples/blocks_watching-blocks) below.

<iframe frameBorder="0" width="100%" height="500px" src="https://stackblitz.com/github/wevm/viem/tree/main/examples/blocks_watching-blocks?embed=1&file=index.ts&hideNavigation=1&hideDevTools=true&terminalHeight=0&ctl=1"></iframe>

## JSON-RPC Methods

- When `poll: true`, calls [`eth_blockNumber`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_blocknumber) on a polling interval.
- When `poll: false` & WebSocket Transport, uses a WebSocket subscription via [`eth_subscribe`](https://docs.alchemy.com/reference/eth-subscribe-polygon) and the `"newHeads"` event. 
