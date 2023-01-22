# HTTP Transport

The `http` Transport connects to a JSON-RPC API via HTTP.

## Import

```ts
import { http } from 'viem'
```

## Usage

```ts {4}
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

const transport = http('https://eth-mainnet.g.alchemy.com/v2/...')

const client = createPublicClient({
  chain: mainnet,
  transport,
})
```

::: warning
If no `url` is provided, then the transport will fall back to a public RPC URL on the chain. It is highly recommended to provide an authenticated RPC URL to prevent rate-limiting.
:::

## Configuration

### url (optional)

- **Type:** `string`
- **Default:** `chain.rpcUrls.default.http[0]`

URL of the JSON-RPC API.

```ts
const transport = http('https://eth-mainnet.g.alchemy.com/v2/...')
```

### key (optional)

- **Type:** `string`
- **Default:** `"http"`

A key for the Transport.

```ts
const transport = http('https://eth-mainnet.g.alchemy.com/v2/...', {
  key: 'alchemy', // [!code focus]
})
```

### name (optional)

- **Type:** `string`
- **Default:** `"HTTP JSON-RPC"`

A name for the Transport

```ts
const transport = http('https://eth-mainnet.g.alchemy.com/v2/...', {
  name: 'Alchemy HTTP Provider', // [!code focus]
})
```
