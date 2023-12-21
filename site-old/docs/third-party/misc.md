---
head:
  - - meta
    - property: og:title
      content: Miscellaneous
  - - meta
    - name: description
      content: Miscellaneous third-party tooling.
  - - meta
    - property: og:description
      content: Miscellaneous third-party tooling.
---

# Miscellaneous Third-Party Tooling

Miscellaneous tooling built for viem.

**Libraries:**
- [reverse-mirage](#reverse-mirage): Building blocks for Ethereum app development. 

## `reverse-mirage`

Building blocks for Ethereum app development. 

### 1. Install

::: code-group

```bash [npm]
npm i reverse-mirage
```

```bash [pnpm]
pnpm i reverse-mirage
```

```bash [bun]
bun i reverse-mirage
```

:::

### 2. Set up a Client

```ts
import { createClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { publicActionsReverseMirage } from 'reverse-mirage'
 
const client = createClient({ 
  chain: mainnet,
  transport: http()
}).extend(publicActionsReverseMirage)
```

### 3. Consume Actions

Now you can consume Actions that are supported by [reverse-mirage](https://www.reversemirage.com/).

[See a full list of `reverse-mirage` Actions.](https://www.reversemirage.com/)

```ts
import { createClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { publicActionsReverseMirage } from 'reverse-mirage'
 
const client = createClient({ 
  chain: mainnet,
  transport: http()
}).extend(publicActionsReverseMirage)

// read token metadata // [!code focus:99]
const usdc = await publicClient.getERC20({
  address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // usdc address
  id: mainnet.id
})

// read a balance
const vitalikBalance = await publicClient.getERC20Balance({
  erc20: usdc,
  address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' // vitalik address
})
```
