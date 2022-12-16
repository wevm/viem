# WebSocket Transport

The `webSocket` Transport connects to a JSON-RPC API via a WebSocket.

## Import

```ts
import { webSocket } from 'viem'
```

## Usage

```ts {4-6}
import { createPublicClient, webSocket } from 'viem'
import { mainnet } from 'viem/chains'

const transport = webSocket({
  url: 'wss://eth-mainnet.g.alchemy.com/v2/...' 
})

const client = createPublicClient({
  chain: mainnet, 
  transport,
})
```

::: warning
If no `url` is provided, then the transport will fall back to a public RPC URL on the chain. It is highly recommended to provide an authenticated RPC URL to prevent rate-limiting.
:::

## Configuration

### url

- **Type:** `string`

URL of the JSON-RPC API.

```ts
const transport = webSocket({
  url: 'wss://eth-mainnet.g.alchemy.com/v2/...' // [!code focus]
})
```

### key (optional)

- **Type:** `string`
- **Default:** `"webSocket"`

A key for the Transport.

```ts
const transport = webSocket({ 
  key: 'alchemy',  // [!code focus]
  url: 'wss://eth-mainnet.g.alchemy.com/v2/...'
})
```

### name (optional)

- **Type:** `string`
- **Default:** `"WebSocket JSON-RPC"`

A name for the Transport

```ts
const transport = webSocket({ 
  name: 'Alchemy WebSocket Provider',  // [!code focus]
  url: 'wss://eth-mainnet.g.alchemy.com/v2/...'
})
```