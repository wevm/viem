# Test Client

The `createTestClient` function sets up a Test RPC Client with a given [transport](/TODO).

::: info
The Test RPC Client provides access to **test actions**.
:::

## Usage

```ts
import { createTestClient, http } from 'viem/clients'
import { foundry } from 'viem/chains'

const client = createTestClient(
  http({ chain: foundry, url: 'http://localhost:8545' }),
  { type: 'anvil' },
)
```

## Supported actions

- [`mine`](/docs/mine)
- [`setBalance`](/docs/setBalance)
