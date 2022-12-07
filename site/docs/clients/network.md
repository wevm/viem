# Network Client

The `createNetworkClient` function sets up a Network Client with a given [transport](/TODO) configured for a [chain](/TODO).

::: info
The Network Client provides access to **public actions**.
:::

## Usage

```ts
import { createNetworkClient, http } from 'viem/clients'
import { mainnet } from 'viem/chains'

const client = createNetworkClient(http({ chain: mainnet }))
```

## Supported actions

- [`fetchBalance`](/docs/fetchBalance)
- [`fetchBlock`](/docs/fetchBlock)
- [`fetchBlockNumber`](/docs/fetchBlockNumber)
- [`fetchTransaction`](/docs/fetchTransaction)
- [`watchBlock`](/docs/watchBlock)
- [`watchBlockNumber`](/docs/watchBlockNumber)
