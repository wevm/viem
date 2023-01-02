# Getting Started

## Installation

::: code-group

```bash [npm]
npm i viem
```

```bash [pnpm]
pnpm i viem
```

```bash [yarn]
yarn add viem
```

:::

## Quick Start

### 1. Set up your Client & Transport

Firstly, set up your [Client](/TODO) with a desired [Transport](/TODO) & [Chain](/TODO).

```tsx
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})
```

::: info
In a production app, it is highly recommended to pass through your authenticated RPC provider URL (Alchemy, Infura, Ankr, etc). If no URL is provided, viem will default to a public RPC provider. [Read more](/TODO).
:::

### 2. Consume Actions!

Now that you have a Client set up, you can now interact with Ethereum and consume [Actions](/TODO)!

```tsx {9}
import { createPublicClient, http, getBlockNumber } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})

const blockNumber = await getBlockNumber(client)
```
