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

### methods (optional)

- **Type:** `{ include?: string[], exclude?: string[] }`

Methods to include or exclude from sending RPC requests.

```ts twoslash
import { ipc } from 'viem/node'
// ---cut---
const transport = ipc('/tmp/reth.ipc', {
  methods: {
    include: ['eth_sendTransaction', 'eth_signTypedData_v4'],
  },
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

### reconnect (optional)

- **Type:** `boolean | { maxAttempts?: number, delay?: number }`
- **Default:** `true`

Whether or not to attempt to reconnect on socket failure.

```ts twoslash
import { ipc } from 'viem/node'
// ---cut---
const transport = ipc('/tmp/reth.ipc', {
  reconnect: false, // [!code focus]
})
```

#### reconnect.attempts (optional)

- **Type:** `number`
- **Default:** `5`

The max number of times to attempt to reconnect.

```ts twoslash
import { ipc } from 'viem/node'
// ---cut---
const transport = ipc('/tmp/reth.ipc', {
  reconnect: {
    attempts: 10, // [!code focus]
  }
})
```

#### reconnect.delay (optional)

- **Type:** `number`
- **Default:** `2_000`

Retry delay (in ms) between reconnect attempts.

```ts twoslash
import { ipc } from 'viem/node'
// ---cut---
const transport = ipc('/tmp/reth.ipc', {
  reconnect: {
    delay: 1_000, // [!code focus]
  }
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
