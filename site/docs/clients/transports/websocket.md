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