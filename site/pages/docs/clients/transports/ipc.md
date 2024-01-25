# IPC Transport [A function to create an IPC Transport for a Client]

The `ipc` Transport connects to a JSON-RPC API via IPC (inter-process communication).

## Import

```ts twoslash
import { ipc } from 'viem/node'
```

## Usage

```ts twoslash
import { createPublicClient } from 'viem'
import { ipc } from 'viem/node'
import { mainnet } from 'viem/chains'

const client = createPublicClient({
  chain: mainnet, 
  transport: ipc('/tmp/reth.ipc'), // [!code hl]
})
```

## Parameters

### path

- **Type:** `string`

IPC Path the transport should connect to.

```ts twoslash
import { ipc } from 'viem/node'
// ---cut---
const transport = ipc('/tmp/reth.ipc')
```

### key (optional)

- **Type:** `string`
- **Default:** `"ipc"`

A key for the Transport.

```ts twoslash
import { ipc } from 'viem/node'
// ---cut---
const transport = ipc('/tmp/reth.ipc', { 
  key: 'reth-ipc',  // [!code focus]
})
```

### name (optional)

- **Type:** `string`
- **Default:** `"IPC JSON-RPC"`

A name for the Transport

```ts twoslash
import { ipc } from 'viem/node'
// ---cut---
const transport = ipc('/tmp/reth.ipc', { 
  name: 'Reth IPC',  // [!code focus]
})
```

### retryCount (optional)

- **Type:** `number`
- **Default:** `3`

The max number of times to retry when a request fails.

```ts twoslash
import { ipc } from 'viem/node'
// ---cut---
const transport = ipc('/tmp/reth.ipc', {
  retryCount: 5, // [!code focus]
})
```

### retryDelay (optional)

- **Type:** `number`
- **Default:** `150`

The base delay (in ms) between retries. By default, the Transport will use [exponential backoff](https://en.wikipedia.org/wiki/Exponential_backoff) (`~~(1 << count) * retryDelay`), which means the time between retries is not constant.

```ts twoslash
import { ipc } from 'viem/node'
// ---cut---
const transport = ipc('/tmp/reth.ipc', {
  retryDelay: 100, // [!code focus]
})
```

### timeout (optional)

- **Type:** `number`
- **Default:** `10_000`

The timeout for async IPC requests.

```ts twoslash
import { ipc } from 'viem/node'
// ---cut---
const transport = ipc('/tmp/reth.ipc', {
  timeout: 60_000, // [!code focus]
})
```
