---
description: Retrieves information about a User Operation given a hash.
---

# getUserOperationReceipt

Retrieves information about a User Operation given a hash.

## Usage

:::code-group

```ts twoslash [example.ts]
import { bundlerClient } from './client'

const result = await bundlerClient.getUserOperation({ // [!code focus:99]
  hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d'
})
```

```ts twoslash [client.ts] filename="client.ts"
import { http } from 'viem'
import { createBundlerClient } from 'viem/account-abstraction'
import { mainnet } from 'viem/chains'

export const bundlerClient = createBundlerClient({
  chain: mainnet,
  transport: http('https://public.stackup.sh/api/v1/node/ethereum-mainnet')
})
```

:::

## Returns

```ts
{
  blockHash: Hash,
  blockNumber: bigint,
  entryPoint: Address,
  transactionHash: Hash,
  userOperation: UserOperation
}
```

User Operation information.

## Parameters

### hash

- **Type:** `'0x${string}'`

A User Operation hash.

```ts
const result = await publicClient.getUserOperation({
  hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d' // [!code focus]
})
```
