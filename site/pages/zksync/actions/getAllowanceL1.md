---
description: Determines the amount of approved tokens for a specific L1 bridge.
---

# getAllowanceL1

Determines the amount of approved tokens for a specific L1 bridge.

## Usage

:::code-group

```ts [example.ts]
import { account, publicClient } from './config'

const allowance = await publicClient.getAllowanceL1({
    token: '0x5C221E77624690fff6dd741493D735a17716c26B',
    bridgeAddress: '0x84DbCC0B82124bee38e3Ce9a92CdE2f943bab60D',
    account
})
```

```ts [config.ts]
import { createPublicClient, custom } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'
import { publicActionsL1 } from 'viem/zksync'

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: custom(window.ethereum)
}).extend(publicActionsL1())

// JSON-RPC Account
export const account = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
// Local Account
export const account = privateKeyToAccount(...)
```

:::

## Returns

`bigint`

Returns the amount of approved tokens.

## Parameters

### token

- **Type:** `Address`

The Ethereum address of the token.

```ts
const allowance = await publicClient.getAllowanceL1({
    token: '0x5C221E77624690fff6dd741493D735a17716c26B', // [!code focus]
    bridgeAddress: '0x84DbCC0B82124bee38e3Ce9a92CdE2f943bab60D',
    account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
    blockTag: 'latest',
})
```

### bridgeAddress

- **Type:** `Address`

The address of the bridge contract to be used.

```ts
const allowance = await publicClient.getAllowanceL1({
    token: '0x5C221E77624690fff6dd741493D735a17716c26B', 
    bridgeAddress: '0x84DbCC0B82124bee38e3Ce9a92CdE2f943bab60D', // [!code focus]
    account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
    blockTag: 'latest', 
})
```

### account

- **Type:** `Account | Address`

The Account used for check.

Accepts a [JSON-RPC Account](/docs/clients/wallet#json-rpc-accounts) or [Local Account (Private Key, etc)](/docs/clients/wallet#local-accounts-private-key-mnemonic-etc).

```ts
const allowance = await publicClient.getAllowanceL1({
    token: '0x5C221E77624690fff6dd741493D735a17716c26B',
    bridgeAddress: '0x84DbCC0B82124bee38e3Ce9a92CdE2f943bab60D',
    account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266' // [!code focus]
    blockTag: 'latest',
})
```

### blockTag (optional)

- **Type:** `BlockTag | undefined`

In which block an allowance should be checked on. The latest processed one is the default option.

```ts
const allowance = await publicClient.getAllowanceL1({
    token: '0x5C221E77624690fff6dd741493D735a17716c26B',
    bridgeAddress: '0x84DbCC0B82124bee38e3Ce9a92CdE2f943bab60D',
    account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
    blockTag: 'latest', // [!code focus]
})
```