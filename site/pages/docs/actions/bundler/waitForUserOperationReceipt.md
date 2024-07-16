---
description: Waits for the User Operation to be included on a Block, and then returns the User Operation receipt.
---

# getUserOperationReceipt

Waits for the User Operation to be included on a [Block](https://viem.sh/docs/glossary/terms#block) (one confirmation), and then returns the User Operation receipt.

## Usage

:::code-group

```ts [example.ts]
import { bundlerClient } from './client'

const receipt = await bundlerClient.waitForUserOperationReceipt({ // [!code focus:99]
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

```ts [client.ts] filename="client.ts"
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

A User Operation hash.

```ts
const receipt = await publicClient.waitForUserOperationReceipt({
  hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d' // [!code focus]
})
```

### pollingInterval

- **Type:** `number`

Polling frequency (in ms).

```ts
const receipt = await publicClient.waitForUserOperationReceipt({
  hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
  pollingInterval: 1_000 // [!code focus]
})
```

### retryCount

- **Type:** `number`
- **Default:** `6`

The number of times to retry.

```ts
const receipt = await publicClient.waitForUserOperationReceipt({
  hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
  retryCount: 3 // [!code focus]
})
```

### timeout

- **Type:** `number`

Optional timeout (in ms) to wait before stopping polling.

```ts
const receipt = await publicClient.waitForUserOperationReceipt({
  hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
  timeout: 30_000 // [!code focus]
})
```
