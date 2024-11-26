---
description: Waits for the User Operation to be included on a Block, and then returns the User Operation receipt.
---

# getUserOperationReceipt

Waits for the User Operation to be included on a [Block](https://viem.sh/docs/glossary/terms#block) (one confirmation), and then returns the User Operation receipt.

## Usage

:::code-group

```ts twoslash [example.ts]
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

```ts twoslash [client.ts] filename="client.ts"
import { http } from 'viem'
import { createBundlerClient } from 'viem/account-abstraction'
import { mainnet } from 'viem/chains'

export const bundlerClient = createBundlerClient({
  chain: mainnet,
  transport: http('https://public.pimlico.io/v2/1/rpc')
})
```

:::

:::info
The Bundler URL above is a public endpoint. Please do not use it in production as you will likely be rate-limited. Consider using [Pimlico's Bundler](https://www.pimlico.io), [Biconomy's Bundler](https://www.biconomy.io), or another Bundler service.
:::

## Returns

`UserOperationReceipt`

The User Operation receipt.

## Parameters

### hash

- **Type:** `'0x${string}'`

A User Operation hash.

```ts twoslash
import { bundlerClient } from './client'
// ---cut---
const receipt = await bundlerClient.waitForUserOperationReceipt({
  hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d' // [!code focus]
})
```

### pollingInterval (optional)

- **Type:** `number`

Polling frequency (in ms).

```ts twoslash
import { bundlerClient } from './client'
// ---cut---
const receipt = await bundlerClient.waitForUserOperationReceipt({
  hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
  pollingInterval: 1_000 // [!code focus]
})
```

### retryCount (optional)

- **Type:** `number`
- **Default:** `6`

The number of times to retry.

```ts twoslash
import { bundlerClient } from './client'
// ---cut---
const receipt = await bundlerClient.waitForUserOperationReceipt({
  hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
  retryCount: 3 // [!code focus]
})
```

### timeout (optional)

- **Type:** `number`

Optional timeout (in ms) to wait before stopping polling.

```ts twoslash
import { bundlerClient } from './client'
// ---cut---
const receipt = await bundlerClient.waitForUserOperationReceipt({
  hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
  timeout: 30_000 // [!code focus]
})
```
