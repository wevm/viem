---
description: Returns the value from erc20 contract based on the function name.
---

# getErc20ContractValue

## Usage

:::code-group
```ts [example.ts]
import { client } from './config'

  const address = await client.getErc20ContractValue({
    l1TokenAddress:'0x05b30BE4e32E6dD6eEe2171E0746e987BeCc9b36',
    functionName:'symbol'
  })
```

```ts [config.ts]
import { createPublicClient, http } from 'viem'
import { zkSyncLocalNode } from 'viem/chains'
import { publicActionsL1 } from 'viem/zksync'

export const client = createPublicClient({
  chain: zkSyncLocalNodeL1,
  transport: http(),
}).extend(publicActionsL1())

```
:::

## Returns

`string`

Value from Erc20 Smart contract.

## Parameters

### l1TokenAddress

- **Type:** `Address`

The address of Erc20 Smart Contract on L1.

```ts
import { client } from './config'

  const address = await client.getErc20ContractValue({
    l1TokenAddress:'0x05b30BE4e32E6dD6eEe2171E0746e987BeCc9b36', // [!code focus]
    functionName:'symbol'
  })
```

### functionName

- **Type:** `string`

Function name to call on a contract.

```ts
import { client } from './config'

  const address = await client.getErc20ContractValue({
    l1TokenAddress:'0x05b30BE4e32E6dD6eEe2171E0746e987BeCc9b36', 
    functionName:'name' // [!code focus]
  })
```