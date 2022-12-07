# Getting Started

## Installation

```bash
npm i viem
```

## Quick Start

### 1. Set up your client & transport

Firstly, set up your [client](/TODO) with a desired [transport](/TODO) & [chain](/TODO).

```tsx
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient(http({ chain: mainnet }))
```

::: info
In a production app, it is highly recommended to pass through your authenticated RPC provider URL (Alchemy, Infura, Ankr, etc). If no URL is provided, viem will default to a public RPC provider. [Read more](/TODO).
:::

### 2. Consume actions!

Now that you have a Client set up, you can now interact with Ethereum and consume [actions](/TODO)!

```tsx {6}
import { createPublicClient, http, fetchBlockNumber } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient(http({ chain: mainnet }))

const blockNumber = await fetchBlockNumber(client)
```
