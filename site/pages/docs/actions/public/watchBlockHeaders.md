---
description: Watches and returns incoming block headers.
---

# watchBlockHeaders

Watches and returns incoming block headers without fetching full blocks. This Action requires a [WebSocket Transport](/docs/clients/transports/websocket) or [IPC Transport](/docs/clients/transports/ipc).

## Usage

```ts twoslash
import { createPublicClient, webSocket } from 'viem'
import { mainnet } from 'viem/chains'

const publicClient = createPublicClient({
  chain: mainnet,
  transport: webSocket(),
})

const unwatch = publicClient.watchBlockHeaders({
  onBlockHeader: (blockHeader) => console.log(blockHeader),
})
```

## Returns

`UnwatchFn`

A function that can be invoked to stop watching for new block headers.

## Parameters

### onBlockHeader

- **Type:** `(blockHeader: BlockHeader, prevBlockHeader?: BlockHeader) => void`

The incoming block header and the previously emitted block header.

### onError (optional)

- **Type:** `(error: Error) => void`

Error thrown while listening for new block headers.

## JSON-RPC Methods

Uses a WebSocket or IPC subscription via [`eth_subscribe`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_subscribe) and the `"newHeads"` event.
