# watchBlocks

Watches and returns information for incoming blocks.

## Import

```ts
import { watchBlocks } from 'viem/public'
```

## Usage

Pass through your Public Client, along with a listener.

```ts
import { watchBlocks } from 'viem/public'
import { publicClient } from '.'
 
const unwatch = watchBlocks( // [!code focus:99]
  publicClient,
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

## Returns

`UnwatchFn`

A function that can be invoked to stop watching for new blocks.

## Parameters

### onBlock

- **Type:** `(block: Block) => void`

The block information.

```ts
const unwatch = watchBlocks(
  publicClient,
  { onBlock: block => console.log(block) } // [!code focus:1]
)
```

### onError (optional)

- **Type:** `(error: Error) => void`

Error thrown from getting a block.

```ts
const unwatch = watchBlocks(
  publicClient,
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
const unwatch = watchBlocks(
  client,
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
const unwatch = watchBlocks(
  client,
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
const unwatch = watchBlocks(
  client,
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
const unwatch = watchBlocks(
  client,
  { 
    onBlock: block => console.log(block),
    pollingInterval: true, // [!code focus]
  }
)
```
