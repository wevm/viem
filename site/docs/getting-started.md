---
head:
  - - meta
    - property: og:title
      content: Getting Started
  - - meta
    - name: description
      content: Get started with viem in just a few lines of code.
  - - meta
    - property: og:description
      content: Get started with viem in just a few lines of code.
---

# Getting Started

## Overview

viem is a TypeScript interface for Ethereum that provides low-level stateless primitives for interacting with Ethereum. viem is focused on developer experience, stability, bundle size, and performance:

- **Developer experience** Automatic [type safety and inference](/docs/typescript), comprehensive documentation, composable APIs.
- **Stability** Test suite runs against forked Ethereum networks, complete [test coverage](https://app.codecov.io/gh/wevm/viem).
- **Bundle size** Tree-shakable lightweight modules.
- **Performance** Optimized encoding/parsing, async tasks only when necessary.

You can learn more about the rationale behind the project in the [Why viem](/docs/introduction) section.

## Installation

::: code-group

```bash [npm]
npm i viem
```

```bash [pnpm]
pnpm i viem
```

```bash [bun]
bun i viem
```

:::

## Quick Start

### 1. Set up your Client & Transport

Firstly, set up your [Client](/docs/clients/intro) with a desired [Transport](/docs/clients/intro) & [Chain](/docs/clients/chains).

```tsx {4-7}
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})
```

::: info
In a production app, it is highly recommended to pass through your authenticated RPC provider URL (Alchemy, Infura, Ankr, etc). If no URL is provided, viem will default to a public RPC provider. [Read more](/docs/clients/transports/http.html#usage).
:::

### 2. Consume Actions

Now that you have a Client set up, you can now interact with Ethereum and consume [Actions](/docs/actions/public/introduction)!

```tsx {9}
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})

const blockNumber = await client.getBlockNumber()
```

### Live example

<iframe class="mt-6" frameborder="0" src="https://stackblitz.com/edit/viem-getting-started?embed=1&file=index.ts&hideNavigation=1&hideDevTools=true&terminalHeight=1&hideExplorer=1&devtoolsheight=1&ctl=1"></iframe>
