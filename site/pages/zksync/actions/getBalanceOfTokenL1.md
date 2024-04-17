---
description: Retrieve the token balance held by the contract on L1.
---

# getBalanceOfTokenL1

Retrieve the token balance held by the contract on L1.

## Usage

:::code-group

```ts [example.ts]
import { account, publicClient } from './config'

const balance = await publicClient.getBalanceOfTokenL1({
    token: '0x5C221E77624690fff6dd741493D735a17716c26B',
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

Returns the amount of the tokens.

## Parameters

### token

- **Type:** `Address`

The address of the token.

```ts
const balance = await publicClient.getBalanceOfTokenL1({
    token: '0x5C221E77624690fff6dd741493D735a17716c26B', // [!code focus]
    account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
    blockTag: 'latest',
})
```

### account

- **Type:** `Account | Address`

The Account used for check.

Accepts a [JSON-RPC Account](/docs/clients/wallet#json-rpc-accounts) or [Local Account (Private Key, etc)](/docs/clients/wallet#local-accounts-private-key-mnemonic-etc).

```ts
const balance = await publicClient.getBalanceOfTokenL1({
    token: '0x5C221E77624690fff6dd741493D735a17716c26B',
    account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266' // [!code focus]
    blockTag: 'latest',
})
```

### blockTag (optional)

- **Type:** `BlockTag | undefined`

In which block an balance should be checked on. The latest processed one is the default option.

```ts
const balance = await publicClient.getBalanceOfTokenL1({
    token: '0x5C221E77624690fff6dd741493D735a17716c26B',
    account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
    blockTag: 'latest', // [!code focus]
})
```