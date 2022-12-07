# WebSocket Transport

The `webSocket` transport connects to a JSON-RPC API via a WebSocket.

## Usage

```ts {5}
import { createPublicClient, webSocket } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient(
  webSocket({ chain: mainnet, url: 'wss://eth-mainnet.g.alchemy.com/v2/...' }),
)
```

::: warning
If no `url` is provided, then the transport will fall back to a public RPC URL on the chain. It is highly recommended to provide an authenticated RPC URL to prevent rate-limiting.
:::
