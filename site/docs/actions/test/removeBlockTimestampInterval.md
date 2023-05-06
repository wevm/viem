---
head:
  - - meta
    - property: og:title
      content: removeBlockTimestampInterval
  - - meta
    - name: description
      content: Removes `setBlockTimestampInterval` if it exists.
  - - meta
    - property: og:description
      content: Removes `setBlockTimestampInterval` if it exists.

---

# removeBlockTimestampInterval

Removes [`setBlockTimestampInterval`](/docs/actions/test/setBlockTimestampInterval.html) if it exists.

## Usage

::: code-group

```ts [example.ts]
import { testClient } from './client'

await testClient.removeBlockTimestampInterval() // [!code focus]
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

