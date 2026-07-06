---
description: Adds state previously dumped to the current chain.
---

# loadState

Adds state previously dumped with `dumpState` to the current chain.

## Usage

:::code-group

```ts [example.ts]
import { testClient } from './client'

await testClient.loadState({ state: '0x1f8b08000000000000ffad934d8e1c310885ef52eb5e003660e636184c3651b7949948915a7df7b8934ded6bbcc23fe2f3e3c1f3f088c7effbd7e7f1f13ce00ff60c35939e4e016352131bb3658bd0f046682dcd98dfafef8f7bace3036ec7f49ffe2fde190817da82b0e9933abcd7713be291ffaf77fcf9f5f8e53ff6f6f97addde4cced6dd8b3b89e6d4d468a2a3d93e537480fd15713933f12a73ebc2b106ae561c59bae1d152784733c067f1dc49479d987295d9a2f7c8cc296e00e534797026d94ed312a9bc93b5192726d155a882999a42300ea48ce680109a80936141a2be0d8f7182f6cb4a0d4a6d96ac49d16b2834e1a5836dd0c242c0b5751ac8d9d1cb4a4d65b97620594ac2dc77a159cbb9ab349f096fedee76828ecb4cdb20d044679e1124c6c1633a4acda639d026f81ea96f15eab0963a76ca3d2f81b58705fbea3e4a59761b11f8769ce0046d5799d5ac5216a37b8e51523d96f81c839476fb54d53422393bda94af505fafbf9d0612379c040000' })
```

```ts [client.ts]
import { createTestClient, http } from 'viem'
import { foundry } from 'viem/chains'

export const testClient = createTestClient({
  chain: foundry,
  mode: 'anvil',
  transport: http(), 
})
```

:::

## Parameters

### state

- **Type:** `Hex`

The state as a data blob.
