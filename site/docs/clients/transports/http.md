# HTTP Transport

The `http` transport connects to a JSON-RPC API via HTTP.

## Usage

```ts {5}
import { createNetworkClient, http } from 'viem/clients'
import { mainnet } from 'viem/chains'

const client = createNetworkClient(
  http({ chain: mainnet, url: 'https://eth-mainnet.g.alchemy.com/v2/...' }),
)
```

::: warning
If no `url` is provided, then the transport will fall back to a public RPC URL on the chain. It is highly recommended to provide an authenticated RPC URL to prevent rate-limiting.
:::
