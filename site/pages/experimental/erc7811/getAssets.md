---
description: Requests to get assets for an account from a Wallet.
---

# getAssets

Requests to get assets for an account from a Wallet.

## Usage

:::code-group

```ts twoslash [example.ts]
import { walletClient } from './config'
 
const assets = await walletClient.getAssets({ // [!code focus]
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', // [!code focus]
}) // [!code focus]
```

```ts twoslash [config.ts] filename="config.ts"
import 'viem/window'
// ---cut---
import { createWalletClient, custom } from 'viem'
import { erc7811Actions } from 'viem/experimental'

export const walletClient = createWalletClient({
  transport: custom(window.ethereum!),
}).extend(erc7811Actions())
```

:::

## Returns

List of assets for the given account. 

The `0` key represents the aggregated assets across the returned chains.

```ts
type ReturnType = {
  /** Aggregated assets across returned chains. */
  0: readonly {
    address: Address | 'native'
    balance: Hex
    chainIds: readonly number[]
    metadata?: unknown | undefined
    type: 'native' | 'erc20' | 'erc721' | (string & {})
  }[]
  
  /** Assets for each chain. */
  [chainId: number]: readonly {
    address: Address | 'native'
    balance: Hex
    metadata?: unknown | undefined
    type: 'native' | 'erc20' | 'erc721' | (string & {})
  }[]
}
```

## Parameters

### `account`

- **Type:** `Account | Address`

The account to get assets for.

```ts
import { walletClient } from './config'
 
const assets = await walletClient.getAssets({ 
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', // [!code focus]
}) 
```

### `assets`

- **Type:** `{ [chainId: number]: readonly { address: Address | 'native', type: 'native' | 'erc20' | 'erc721' | (string & {}) }[] }`

Filter by assets.

```ts
import { walletClient } from './config'
 
const assets = await walletClient.getAssets({ 
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  assets: { // [!code focus]
    8453: [{ address: '0x1234567890abcdef1234567890abcdef12345678', type: 'erc20' }], // [!code focus]
  }, // [!code focus]
}) 
```

### `assetTypes`

- **Type:** `readonly ('native' | 'erc20' | 'erc721' | (string & {}))[]`

Filter by asset types.

```ts
import { walletClient } from './config'
 
const assets = await walletClient.getAssets({ 
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  assetTypes: ['erc20'], // [!code focus]
}) 
```

### `chainIds`

- **Type:** `readonly number[]`

Filter by chain IDs.

```ts
import { walletClient } from './config'
 
const assets = await walletClient.getAssets({ 
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  chainIds: [8453], // [!code focus]
}) 
```

## JSON-RPC Methods

- [`wallet_getAssets`](https://github.com/ethereum/ERCs/blob/master/ERCS/erc-7811.md)
