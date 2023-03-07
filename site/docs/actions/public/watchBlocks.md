---
head:
  - - meta
    - property: og:title
      content: watchBlocks
  - - meta
    - name: description
      content: Watches and returns information for incoming blocks.
  - - meta
    - property: og:description
      content: Watches and returns information for incoming blocks.

---

# watchBlocks

Watches and returns information for incoming blocks.

## Usage

Pass through your Public Client, along with a listener.

::: code-group

```ts [example.ts]
import { publicClient } from './client'

const unwatch = publicClient.watchBlocks( // [!code focus:99]
  { onBlock: block => console.log(block) }
)
/**
 * > {
 *  baseFeePerGas: 10789405161n,
 *  difficulty: 11569232145203128n,
 *  extraData: '0x75732d656173742d38',
 *  ...
 * }
 * 
 * > {
 *  baseFeePerGas: 12394051511n,
 *  difficulty: 11512315412421123n,
 *  extraData: '0x5123ab1512dd14aa',
 *  ...
 * }
 */
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

A function that can be invoked to stop watching for new blocks.

## Parameters

### onBlock

- **Type:** `(block: Block) => void`

The block information.

```ts
const unwatch = publicClient.watchBlocks(
  { onBlock: block => console.log(block) } // [!code focus:1]
)
```

### onError (optional)

- **Type:** `(error: Error) => void`

Error thrown from getting a block.

```ts
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

```ts
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

Missed blocks may occur in instances where internet connection is lost, or the block time is lesser than the [polling interval](/docs/clients/public.html#pollinginterval-optional) of the client.

```ts
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

```ts
const unwatch = publicClient.watchBlocks(
  { 
    emitOnBegin: true, // [!code focus]
    onBlock: block => console.log(block),
  }
)
```

### pollingInterval (optional)

- **Type:** `number`

Polling frequency (in ms). Defaults to the Client's `pollingInterval` config.

```ts
const unwatch = publicClient.watchBlocks(
  { 
    onBlock: block => console.log(block),
    pollingInterval: true, // [!code focus]
  }
)
```

## JSON-RPC Methods

Calls [`eth_getBlockByNumber`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getBlockByNumber) on a polling interval. 

Real-time subscriptions ([`eth_subscribe`](https://docs.alchemy.com/reference/eth-subscribe-polygon)) coming shortly.