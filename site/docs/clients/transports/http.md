# HTTP Transport

The `http` Transport connects to a JSON-RPC API via HTTP.

## Import

```ts
import { http } from 'viem'
```

## Usage

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient(
  http({ // [!code focus:4]
    chain: mainnet,
    url: 'https://eth-mainnet.g.alchemy.com/v2/...',
  })
)
```

::: warning
If no `url` is provided, then the transport will fall back to a public RPC URL on the chain. It is highly recommended to provide an authenticated RPC URL to prevent rate-limiting.
:::

## Configuration

### chain

- **Type:** [`Chain`](/TODO)

The Chain that the Transport should connect to.

```ts
const client = createPublicClient(
  http({ 
    chain: mainnet, // [!code focus]
    url: 'https://eth-mainnet.g.alchemy.com/v2/...',
  })
)
```

> Read more on [Chains](/TODO).

### key (optional)

- **Type:** `string`
- **Default:** `"http"`

A key for the Transport.

```ts
const client = createPublicClient(
  http({ 
    chain: mainnet,
    key: 'alchemy', // [!code focus]
    url: 'https://eth-mainnet.g.alchemy.com/v2/...',
  })
)
```

### name (optional)

- **Type:** `string`
- **Default:** `"HTTP JSON-RPC"`

A name for the Transport

```ts
const client = createPublicClient(
  http({ 
    chain: mainnet,
    name: 'Alchemy HTTP Provider', // [!code focus]
    url: 'https://eth-mainnet.g.alchemy.com/v2/...',
  })
)
```

### url (optional)

- **Type:** `string`
- **Default:** `chain.rpcUrls.default.http[0]`

URL of the JSON-RPC API.

```ts
const client = createPublicClient(
  http({ 
    chain: mainnet,
    url: 'https://eth-mainnet.g.alchemy.com/v2/...', // [!code focus]
  })
)
```