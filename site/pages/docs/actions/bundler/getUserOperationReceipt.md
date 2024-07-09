---
description: Returns the User Operation receipt given a User Operation hash.
---

# getUserOperationReceipt

Returns the User Operation Receipt given a User Operation hash.

## Usage

:::code-group

```ts twoslash [example.ts]
import { bundlerClient } from './client'

const receipt = await bundlerClient.getUserOperationReceipt({ // [!code focus:99]
  hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d'
})
// @log: {
// @log:   blockHash: '0xaf1dadb8a98f1282e8f7b42cc3da8847bfa2cf4e227b8220403ae642e1173088',
// @log:   blockNumber: 15132008n,
// @log:   sender: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
// @log:   ...
// @log:   status: 'success',
// @log: }
```

```ts twoslash [client.ts] filename="client.ts"
import { createBundlerClient, http } from 'viem'
import { mainnet } from 'viem/chains'

export const bundlerClient = createBundlerClient({
  chain: mainnet,
  transport: http('https://public.stackup.sh/api/v1/node/ethereum-mainnet')
})
```

:::

## Returns

`UserOperationReceipt`

The User Operation receipt.

## Parameters

### hash

- **Type:** `'0x${string}'`

A transaction hash.

```ts twoslash
import { bundlerClient } from './client'
// ---cut---
const transaction = await publicClient.getUserOperationReceipt({
  hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d' // [!code focus]
})
```
