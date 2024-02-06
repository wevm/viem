---
description: Watches and returns information for incoming blocks.
---

# watchBlocks

Watches and returns information for incoming blocks.

## Usage

Pass through your Public Client, along with a listener.

:::code-group

```ts twoslash [example.ts]
import { publicClient } from './client'

const unwatch = publicClient.watchBlocks( // [!code focus:99]
  { onBlock: block => console.log(block) }
)
// @log: > {
// @log:  baseFeePerGas: 10789405161n,
// @log:  difficulty: 11569232145203128n,
// @log:  extraData: '0x75732d656173742d38',
// @log:  ...
// @log: }

// @log: > {
// @log:  baseFeePerGas: 12394051511n,
// @log:  difficulty: 11512315412421123n,
// @log:  extraData: '0x5123ab1512dd14aa',
// @log:  ...
// @log: }
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

A function that can be invoked to stop watching for new blocks.

## Parameters

### onBlock

- **Type:** `(block: Block) => void`

The block information.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const unwatch = publicClient.watchBlocks(
  { onBlock: block => console.log(block) } // [!code focus:1]
)
```

### onError (optional)

- **Type:** `(error: Error) => void`

Error thrown from getting a block.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const unwatch = publicClient.watchBlocks(
  { 
    onBlock: block => console.log(block),
    onError: error => console.log(error) // [!code focus:1]
  }
)
```

### blockTag (optional)

- **Type:** `'latest' | 'earliest' | 'pending' | 'safe' | 'finalized'`
- **Default:** `'latest'`

Watch for new blocks on a given tag.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const unwatch = publicClient.watchBlocks(
  { 
    blockTag: 'safe',
    onBlock: block => console.log(block), // [!code focus]
  }
)
```

### emitMissed (optional)

- **Type:** `boolean`
- **Default:** `false`

Whether or not to emit missed blocks to the callback.

Missed blocks may occur in instances where internet connection is lost, or the block time is lesser than the [polling interval](/docs/clients/public#pollinginterval-optional) of the client.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const unwatch = publicClient.watchBlocks(
  { 
    emitMissed: true, // [!code focus]
    onBlock: block => console.log(block),
  }
)
```

### emitOnBegin (optional)

- **Type:** `boolean`
- **Default:** `false`

Whether or not to emit the block to the callback when the subscription opens.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const unwatch = publicClient.watchBlocks(
  { 
    emitOnBegin: true, // [!code focus]
    onBlock: block => console.log(block),
  }
)
```

### includeTransactions (optional)

- **Type:** `boolean`

Whether or not to include transactions (as a structured array of `Transaction` objects).

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const unwatch = publicClient.watchBlocks(
  { 
    includeTransactions: true,  // [!code focus]
    onBlock: block => console.log(block),
  }
)
```

### poll (optional)

- **Type:** `boolean`
- **Default:** `false` for WebSocket Clients, `true` for non-WebSocket Clients

Whether or not to use a polling mechanism to check for new blocks instead of a WebSocket subscription.

This option is only configurable for Clients with a [WebSocket Transport](/docs/clients/transports/websocket).

```ts twoslash
import { createPublicClient, webSocket } from 'viem'
import { mainnet } from 'viem/chains'

const publicClient = createPublicClient({
  chain: mainnet,
  transport: webSocket()
})

const unwatch = publicClient.watchBlocks(
  { 
    onBlock: block => console.log(block),
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
const unwatch = publicClient.watchBlocks(
  { 
    onBlock: block => console.log(block),
    pollingInterval: 1_000, // [!code focus]
  }
)
```

## Example

Check out the usage of `watchBlocks` in the live [Watch Blocks Example](https://stackblitz.com/github/wevm/viem/tree/main/examples/blocks_watching-blocks) below.

<iframe frameBorder="0" width="100%" height="500px" src="https://stackblitz.com/github/wevm/viem/tree/main/examples/blocks_watching-blocks?embed=1&file=index.ts&hideNavigation=1&hideDevTools=true&terminalHeight=0&ctl=1"></iframe>

## JSON-RPC Methods

- When `poll: true`, calls [`eth_getBlockByNumber`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getBlockByNumber) on a polling interval.
- When `poll: false` & WebSocket Transport, uses a WebSocket subscription via [`eth_subscribe`](https://docs.alchemy.com/reference/eth-subscribe-polygon) and the `"newHeads"` event.
