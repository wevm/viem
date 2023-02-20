# watchBlockNumber

Watches and returns incoming block numbers.

## Usage

Pass through your Public Client, along with a listener.

```ts
import { publicClient } from '.'
 
const unwatch = publicClient.watchBlockNumber( // [!code focus:99]
  { onBlockNumber: blockNumber => console.log(blockNumber) }
)
/**
 * > 69420n
 * > 69421n
 * > 69422n
 */
```

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

Missed block numbers may occur in instances where internet connection is lost, or the block time is lesser than the [polling interval](/docs/clients/public.html#pollinginterval-optional) of the client.

```ts
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

```ts
const unwatch = publicClient.watchBlockNumber(
  { 
    emitOnBegin: true, // [!code focus]
    onBlockNumber: blockNumber => console.log(blockNumber),
  }
)
```

### pollingInterval (optional)

- **Type:** `number`

Polling frequency (in ms). Defaults to Client's `pollingInterval` config.

```ts
const unwatch = publicClient.watchBlockNumber(
  { 
    onBlockNumber: blockNumber => console.log(blockNumber),
    pollingInterval: 12_000, // [!code focus]
  }
)
```