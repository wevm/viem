---
description: Miscellaneous third-party tooling.
---

# Miscellaneous Third-Party Tooling

Miscellaneous tooling built for viem.

**Libraries:**
- [reverse-mirage](#reverse-mirage): Building blocks for Ethereum app development. 
- [covalent-unified-api](#covalent-unified-api): Covalent simplifies your blockchain development experience by reducing the number of API calls required to power your application. Covalent’s unified API supports over 200 chains and empowers developers to quickly retrieve detailed data for aggregated transactions, balances, and NFT’s with industry leading performance.

## `reverse-mirage`

Building blocks for Ethereum app development. 

### 1. Install

:::code-group

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
import { publicActionReverseMirage } from 'reverse-mirage'
 
const client = createClient({ 
  chain: mainnet,
  transport: http()
}).extend(publicActionReverseMirage)
```

### 3. Consume Actions

Now you can consume Actions that are supported by [reverse-mirage](https://www.reversemirage.com/).

[See a full list of `reverse-mirage` Actions.](https://www.reversemirage.com/)

```ts
import { createClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { publicActionReverseMirage } from 'reverse-mirage'
 
const client = createClient({ 
  chain: mainnet,
  transport: http()
}).extend(publicActionReverseMirage)

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

## `Covalent-Unified-API`

Covalent simplifies your blockchain development experience by reducing the number of API calls required to power your application. Covalent’s unified API supports over 200 chains and empowers developers to quickly retrieve detailed data for aggregated transactions, balances, and NFT’s with industry leading performance.

### 1. Install

:::code-group

```bash [npm]
npm i @covalenthq/client-viem-sdk
```

```bash [pnpm]
pnpm i @covalenthq/client-viem-sdk
```

```bash [yarn]
yarn add @covalenthq/client-viem-sdk
```

:::

### 2. Set up a Client

[Learn how to obtain an API key by signing up if you don't already have one.](https://www.covalenthq.com/platform/auth/register/)

```ts
import { createClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { publicActionCovalent } from '@covalenthq/client-viem-sdk'

const client = createClient({ 
  chain: mainnet,
  transport: http()
}).extend(publicActionCovalent("YOUR_API_KEY"));
```

### 3. Consume Actions

Now you can consume Actions that are supported by [Covalent Unified API](https://www.covalenthq.com/docs/api/).

[See a full list of `@covalenthq/client-viem-sdk` Actions.](https://www.npmjs.com/package/@covalenthq/client-viem-sdk)

The `@covalenthq/client-viem-sdk` is powered by the [Covalent client SDK](https://www.npmjs.com/package/@covalenthq/client-sdk).

```ts
import { createClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { publicActionCovalent } from '@covalenthq/client-viem-sdk'

const client = createClient({ 
  chain: mainnet,
  transport: http()
}).extend(publicActionCovalent("YOUR_API_KEY"))

// locate chains which an address is active on with a single API call
const walletActivity = await client.BaseService.getAddressActivity("demo.eth");

// Returns token balances for a specific wallet address
const tokenBalances = await client.BalanceService.getTokenBalancesForWalletAddress(client.chain.id, "demo.eth");

// Renders the NFTs (including ERC721 and ERC1155) held by an address.
const nfts = await client.NftService.getNftsForAddress("eth-mainnet","demo.eth");

// Provides historical floor prices for a specific NFT collection address, covering a period up to 365 days
const floorPrices = await client.NftService.getNftMarketFloorPrice("eth-mainnet","0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d");
```
