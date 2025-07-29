---
description: Returns all known balances for a given account.
---

# getAllBalances

Returns all known balances for a given account.

## Usage

:::code-group

```ts [example.ts]
import { client, account } from './config'

const balances = await client.getAllBalances({
  account
});
```

```ts [config.ts]
import { createPublicClient, http } from 'viem'
import { zksync } from 'viem/chains'
import { publicActionsL2 } from 'viem/zksync'

export const client = createPublicClient({
  chain: zksync,
  transport: http(),
}).extend(publicActionsL2())

// JSON-RPC Account
export const account = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
// Local Account
export const account = privateKeyToAccount(...)

```
:::

## Returns

`GetAllBalancesReturnType`

Array of all known balances for an address.

## Parameters

### account

- **Type:** `Account | Address`

The Account used for check.

Accepts a [JSON-RPC Account](/docs/clients/wallet#json-rpc-accounts) or [Local Account (Private Key, etc)](/docs/clients/wallet#local-accounts-private-key-mnemonic-etc).

```ts
const balances = await client.getAllBalances({
  account: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049"  // [!code focus]
});
```