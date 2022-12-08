# WebSocket Transport

The `webSocket` Transport connects to a JSON-RPC API via a WebSocket.

## Import

```ts
import { webSocket } from 'viem'
```

## Usage

```ts
import { createPublicClient, webSocket } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient(
  webSocket({ // [!code focus:4]
    chain: mainnet, 
    url: 'wss://eth-mainnet.g.alchemy.com/v2/...' 
  })
)
```

::: warning
If no `url` is provided, then the transport will fall back to a public RPC URL on the chain. It is highly recommended to provide an authenticated RPC URL to prevent rate-limiting.
:::

## Configuration

### chain

- **Type:** [`Chain`](/TODO)

The chain that the Transport should connect to.

```ts
const client = createPublicClient(
  webSocket({ 
    chain: mainnet, // [!code focus]
    url: 'wss://eth-mainnet.g.alchemy.com/v2/...' 
  })
)
```

### url

- **Type:** `string`

URL of the JSON-RPC API.

```ts
const client = createPublicClient(
  webSocket({ 
    chain: mainnet,
    url: 'wss://eth-mainnet.g.alchemy.com/v2/...'  // [!code focus]
  })
)
```

### key (optional)

- **Type:** `string`
- **Default:** `"webSocket"`

A key for the Transport.

```ts
const client = createPublicClient(
  webSocket({ 
    chain: mainnet,
    key: 'alchemy',  // [!code focus]
    url: 'wss://eth-mainnet.g.alchemy.com/v2/...'
  })
)
```

### name (optional)

- **Type:** `string`
- **Default:** `"WebSocket JSON-RPC"`

A name for the Transport

```ts
const client = createPublicClient(
  webSocket({ 
    chain: mainnet,
    name: 'Alchemy WebSocket Provider',  // [!code focus]
    url: 'wss://eth-mainnet.g.alchemy.com/v2/...'
  })
)
```