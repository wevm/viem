---
description: Returns all known balances for a given account.
---

# getAllBalances

Returns all known balances for a given account.

## Usage

:::code-group

```ts [example.ts]
import { client } from './config'

const balances = await client.getAllBalances({
  address:"0x36615Cf349d7F6344891B1e7CA7C72883F5dc049"
});
```

```ts [config.ts]
import { createPublicClient, http } from 'viem'
import { zkSyncLocalNode } from 'viem/chains'
import { publicActionsL2 } from 'viem/zksync'

export const client = createPublicClient({
  chain: zkSyncLocalNode,
  transport: http(),
}).extend(publicActionsL2())
```
:::

## Returns

`GetAllBalancesReturnType`

Array of all known balances for an address.

## Parameters

### address

Address for which all balances is requested.

- **Type** `Address`

```ts
const balances = await client.getAllBalances({
  address:"0x36615Cf349d7F6344891B1e7CA7C72883F5dc049"  // [!code focus]
});
```