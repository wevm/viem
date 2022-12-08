# watchBlockNumber

Watches and returns incoming block numbers.

## Import

```ts
import { watchBlockNumber } from 'viem'
```

## Usage

Pass through your Public Client, along with a listener.

```ts
import { watchBlockNumber } from 'viem'
import { publicClient } from '.'
 
const unwatch = watchBlockNumber( // [!code focus:99]
  publicClient,
  blockNumber => console.log(blockNumber)
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

## Configuration

### emitOnBegin (optional)

- **Type:** `boolean`
- **Default:** `false`

Whether or not to emit the latest block number to the callback when the subscription opens.

```ts
const unwatch = watchBlockNumber(
  client,
  blockNumber => console.log(blockNumber),
  { emitOnBegin: true } // [!code focus]
)
```

### pollingInterval (optional)

- **Type:** `number`

Polling frequency (in ms). Defaults to Client's `pollingInterval` config.

```ts
const unwatch = watchBlockNumber(
  client,
  blockNumber => console.log(blockNumber),
  { pollingInterval: 12_000 } // [!code focus]
)
```

## Example

<iframe frameborder="0" width="100%" height="500px" src="https://replit.com/@jxom/TODO"></iframe>