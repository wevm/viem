---
head:
  - - meta
    - property: og:title
      content: watchAsset
  - - meta
    - name: description
      content: Requests that the user tracks the token in their wallet.
  - - meta
    - property: og:description
      content: Requests that the user tracks the token in their wallet.

---

# watchAsset

Requests that the user tracks the token in their wallet. Returns a boolean indicating if the token was successfully added.

## Usage

::: code-group

```ts [example.ts]
import { walletClient } from './client'
 
const success = await walletClient.watchAsset({ // [!code focus:99]
  type: 'ERC20',
  options: {
    address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    decimals: 18,
    symbol: 'WETH',
  },
})
```

```ts [client.ts]
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'

export const walletClient = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum)
})
```

:::

## Returns

`boolean`

Boolean indicating if the token was successfully added.

## Parameters

### type

- **Type:** `string`

Token type.

```ts
const success = await walletClient.watchAsset({
  type: 'ERC20', // [!code focus]
  options: {
    address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    decimals: 18,
    symbol: 'WETH',
  },
});
```

### options.address

- **Type:** [`Address`](/docs/glossary/types#address)

The address of the token contract.

```ts
const success = await walletClient.watchAsset({
  type: 'ERC20',
  options: {
    address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // [!code focus]
    decimals: 18,
    symbol: 'WETH',
  },
});
```

### options.decimals

- **Type:** `number`

The number of token decimals.

```ts
const success = await walletClient.watchAsset({
  type: 'ERC20',
  options: {
    address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    decimals: 18, // [!code focus]
    symbol: 'WETH',
  },
});
```

### options.symbol

- **Type:** `string`

A ticker symbol or shorthand, up to 11 characters.

```ts
const success = await walletClient.watchAsset({
  type: 'ERC20',
  options: {
    address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    decimals: 18
    symbol: 'WETH', // [!code focus]
  }
})
```

### options.image

- **Type:** `string`

A string url of the token logo.

```ts
const success = await walletClient.watchAsset({
  type: 'ERC20',
  options: {
    address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    decimals: 18
    symbol: 'WETH',
    image: 'https://weth.com/icon.png', // [!code focus]
  }
})
```

## JSON-RPC Methods

[`wallet_watchAsset`](https://eips.ethereum.org/EIPS/eip-747)
