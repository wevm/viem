---
head:
  - - meta
    - property: og:title
      content: WebSocket Transport
  - - meta
    - name: description
      content: A function to create a WebSocket Transport for a Client.
  - - meta
    - property: og:description
      content: A function to create a WebSocket Transport for a Client.

---

# WebSocket Transport

The `webSocket` Transport connects to a JSON-RPC API via a WebSocket.

## Import

```ts
import { webSocket } from 'viem'
```

## Usage

```ts {4}
import { createPublicClient, webSocket } from 'viem'
import { mainnet } from 'viem/chains'

const transport = webSocket('wss://eth-mainnet.g.alchemy.com/v2/...')

const client = createPublicClient({
  chain: mainnet, 
  transport,
})
```

::: warning
If no `url` is provided, then the transport will fall back to a public RPC URL on the chain. It is highly recommended to provide an authenticated RPC URL to prevent rate-limiting.
:::

## Parameters

### url

- **Type:** `string`

URL of the JSON-RPC API.

```ts
const transport = webSocket('wss://eth-mainnet.g.alchemy.com/v2/...')
```

### key (optional)

- **Type:** `string`
- **Default:** `"webSocket"`

A key for the Transport.

```ts
const transport = webSocket('wss://eth-mainnet.g.alchemy.com/v2/...', { 
  key: 'alchemy',  // [!code focus]
})
```

### name (optional)

- **Type:** `string`
- **Default:** `"WebSocket JSON-RPC"`

A name for the Transport

```ts
const transport = webSocket('wss://eth-mainnet.g.alchemy.com/v2/...', { 
  name: 'Alchemy WebSocket Provider',  // [!code focus]
})
```

### retryCount (optional)

- **Type:** `number`
- **Default:** `3`

The max number of times to retry when a request fails.

```ts
const transport = webSocket('wss://eth-mainnet.g.alchemy.com/v2/...', {
  retryCount: 5, // [!code focus]
})
```

### retryDelay (optional)

- **Type:** `number`
- **Default:** `150`

The base delay (in ms) between retries. By default, the Transport will use [exponential backoff](https://en.wikipedia.org/wiki/Exponential_backoff) (`~~(1 << count) * retryDelay`), which means the time between retries is not constant.

```ts
const transport = webSocket('wss://eth-mainnet.g.alchemy.com/v2/...', {
  retryDelay: 100, // [!code focus]
})
```

### timeout (optional)

- **Type:** `number`
- **Default:** `10_000`

The timeout for async WebSocket requests.

```ts
const transport = webSocket('wss://eth-mainnet.g.alchemy.com/v2/...', {
  timeout: 60_000, // [!code focus]
})
```
