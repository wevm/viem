---
description: Returns the amount of the token held by the account on the L1 network.
---

# getL1Balance

Returns the amount of the token held by the account on the L1 network.

## Usage

:::code-group

```ts [example.ts (token balance)]
import { account, publicClient } from './config'

const balance = await publicClient.getL1Balance({
  account
  token: '0x5C221E77624690fff6dd741493D735a17716c26B',
})
```

```ts [example.ts (ETH balance)]
import { account, publicClient } from './config'

const balance = await publicClient.getL1Balance({
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

### account (optional)

- **Type:** `Account | Address`

The Account used for check.

Accepts a [JSON-RPC Account](/docs/clients/wallet#json-rpc-accounts) or [Local Account (Private Key, etc)](/docs/clients/wallet#local-accounts-private-key-mnemonic-etc).

```ts
const balance = await publicClient.getL1Balance({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266' // [!code focus]
  blockTag: 'latest',
  token: '0x5C221E77624690fff6dd741493D735a17716c26B',
})
```

### blockTag (optional)

- **Type:** `BlockTag | undefined`

In which block an balance should be checked on. The latest processed one is the default option.

```ts
const balance = await publicClient.getL1Balance({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
  blockTag: 'latest', // [!code focus]
  token: '0x5C221E77624690fff6dd741493D735a17716c26B',
})
```

### token (optional)

- **Type:** `Address`

The address of the token. Defaults to ETH if not provided.

```ts
const balance = await publicClient.getL1Balance({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  blockTag: 'latest',
  token: '0x5C221E77624690fff6dd741493D735a17716c26B', // [!code focus]
})
```