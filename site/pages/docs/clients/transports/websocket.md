# WebSocket Transport [A function to create a WebSocket Transport for a Client]

The `webSocket` Transport connects to a JSON-RPC API via a WebSocket.

## Import

```ts twoslash
import { webSocket } from 'viem'
```

## Usage

```ts twoslash {4}
import { createPublicClient, webSocket } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient({
  chain: mainnet, 
  transport: webSocket('wss://eth-mainnet.g.alchemy.com/v2/...'), // [!code focus]
})
```

:::warning[Warning]
If no `url` is provided, then the transport will fall back to a public RPC URL on the chain. It is highly recommended to provide an authenticated RPC URL to prevent rate-limiting.
:::

## Parameters

### url

- **Type:** `string`

URL of the JSON-RPC API.

```ts twoslash
import { webSocket } from 'viem'
// ---cut---
const transport = webSocket('wss://eth-mainnet.g.alchemy.com/v2/...')
```

### keepAlive (optional)

- **Type:** `boolean | { interval?: number }`
- **Default:** `true`

Whether or not to send keep-alive ping messages.

```ts twoslash
import { webSocket } from 'viem'
// ---cut---
const transport = webSocket('wss://eth-mainnet.g.alchemy.com/v2/...', {
  keepAlive: { interval: 1_000 }, // [!code focus]
})
```

### key (optional)

- **Type:** `string`
- **Default:** `"webSocket"`

A key for the Transport.

```ts twoslash
import { webSocket } from 'viem'
// ---cut---
const transport = webSocket('wss://eth-mainnet.g.alchemy.com/v2/...', { 
  key: 'alchemy',  // [!code focus]
})
```

### methods (optional)

- **Type:** `{ include?: string[], exclude?: string[] }`

Methods to include or exclude from sending RPC requests.

```ts twoslash
import { webSocket } from 'viem'
// ---cut---
const transport = webSocket('wss://eth-mainnet.g.alchemy.com/v2/...', {
  methods: {
    include: ['eth_sendTransaction', 'eth_signTypedData_v4'],
  },
})
```

### name (optional)

- **Type:** `string`
- **Default:** `"WebSocket JSON-RPC"`

A name for the Transport

```ts twoslash
import { webSocket } from 'viem'
// ---cut---
const transport = webSocket('wss://eth-mainnet.g.alchemy.com/v2/...', { 
  name: 'Alchemy WebSocket Provider',  // [!code focus]
})
```

### reconnect (optional)

- **Type:** `boolean | { maxAttempts?: number, delay?: number }`
- **Default:** `true`

Whether or not to attempt to reconnect on socket failure.

```ts twoslash
import { webSocket } from 'viem'
// ---cut---
const transport = webSocket('wss://eth-mainnet.g.alchemy.com/v2/...', {
  reconnect: false, // [!code focus]
})
```

#### reconnect.attempts (optional)

- **Type:** `number`
- **Default:** `5`

The max number of times to attempt to reconnect.

```ts twoslash
import { webSocket } from 'viem'
// ---cut---
const transport = webSocket('wss://eth-mainnet.g.alchemy.com/v2/...', {
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
import { webSocket } from 'viem'
// ---cut---
const transport = webSocket('wss://eth-mainnet.g.alchemy.com/v2/...', {
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
import { webSocket } from 'viem'
// ---cut---
const transport = webSocket('wss://eth-mainnet.g.alchemy.com/v2/...', {
  retryCount: 5, // [!code focus]
})
```

### retryDelay (optional)

- **Type:** `number`
- **Default:** `150`

The base delay (in ms) between retries. By default, the Transport will use [exponential backoff](https://en.wikipedia.org/wiki/Exponential_backoff) (`~~(1 << count) * retryDelay`), which means the time between retries is not constant.

```ts twoslash
import { webSocket } from 'viem'
// ---cut---
const transport = webSocket('wss://eth-mainnet.g.alchemy.com/v2/...', {
  retryDelay: 100, // [!code focus]
})
```

### timeout (optional)

- **Type:** `number`
- **Default:** `10_000`

The timeout for async WebSocket requests.

```ts twoslash
import { webSocket } from 'viem'
// ---cut---
const transport = webSocket('wss://eth-mainnet.g.alchemy.com/v2/...', {
  timeout: 60_000, // [!code focus]
})
```
