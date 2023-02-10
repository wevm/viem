# watchPendingTransactions

Watches and returns pending transaction hashes.

This Action will batch up all the pending transactions found within the [`pollingInterval`](#pollinginterval-optional), and invoke them via [`onTransactions`](#ontransactions).

## Import

```ts
import { watchPendingTransactions } from 'viem/public'
```

## Usage

```ts
import { watchPendingTransactions } from 'viem/public'
import { publicClient } from '.'
 
const unwatch = watchPendingTransactions( // [!code focus:99]
  publicClient,
  { onTransactions: hashes => console.log(hashes) }
)
/**
 * > ['0x...', '0x...', '0x...']
 * > ['0x...', '0x...']
 * > ['0x...', '0x...', '0x...', ...]
 */
```

## Returns

`UnwatchFn`

A function that can be invoked to stop watching for new pending transaction hashes.

## Parameters

### onTransactions

- **Type:** `(hashes: '0x${string}'[]) => void`

The new pending transaction hashes.

```ts
const unwatch = watchPendingTransactions(
  publicClient,
  { onTransactions: hashes => console.log(hashes) } // [!code focus:1]
)
```

### batch (optional)

- **Type:** `boolean`
- **Default:** `true`

Whether or not to batch the transaction hashes between polling intervals.

```ts
const unwatch = watchPendingTransactions(
  publicClient,
  { 
    batch: false, // [!code focus]
    onTransactions: hashes => console.log(hashes),
  }
)
```

### onError (optional)

- **Type:** `(error: Error) => void`

Error thrown from listening for new pending transactions.

```ts
const unwatch = watchPendingTransactions(
  publicClient,
  { 
    onError: error => console.log(error) // [!code focus:1]
    onTransactions: hashes => console.log(hashes),
  }
)
```

### pollingInterval (optional)

- **Type:** `number`

Polling frequency (in ms). Defaults to the Client's `pollingInterval` config.

```ts
const unwatch = watchPendingTransactions(
  client,
  { 
    pollingInterval: 1_000, // [!code focus]
    onTransactions: hashes => console.log(hashes),
  }
)
```