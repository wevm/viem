# watchAsset

Requests that the user tracks the token in their wallet. Returns a boolean indicating if the token was successfully added.

## Usage

```ts
import { watchAsset } from 'viem';
```

## Usage

```ts
import { watchAsset } from 'viem';
import { walletClient } from '.';

await watchAsset(walletClient, {
  // [!code focus:99]
  type: 'ERC20',
  options: {
    address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    decimals: 18,
    symbol: 'WETH',
  },
});
```

## Returns

`boolean`

Boolean indicating if the token was successfully added.

## Parameters

### type

- **Type:** `string`

Token type.

```ts
await watchAsset(walletClient, {
  type: 'ERC20', // [!code focus]
  options: {
    address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    decimals: 18,
    symbol: 'WETH',
  },
});
```

### options.address

- **Type:** `Address`

The address of the token contract.

```ts
await watchAsset(walletClient, {
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
await watchAsset(walletClient, {
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
await watchAsset(walletClient, {
  type: 'ERC20',
  options: {
    address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    decimals: 18
    symbol: 'WETH', // [!code focus]
  }
})
```

### options.address

- **Type:** `string`

A string url of the token logo.

```ts
await watchAsset(walletClient, {
  type: 'ERC20',
  options: {
    address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    decimals: 18
    symbol: 'WETH',
    image: 'https://weth.com/icon.png', // [!code focus]
  }
})
```
