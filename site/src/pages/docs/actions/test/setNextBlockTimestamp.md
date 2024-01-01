---
description: Sets the next block's timestamp.
---

# setNextBlockTimestamp

Sets the next block's timestamp.

## Usage

:::code-group

```ts [example.ts]
import { testClient } from './client'
 
await testClient.setNextBlockTimestamp({ // [!code focus:4]
  timestamp: 1671744314n
})
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

### timestamp

- **Type:** `bigint`

```ts
await testClient.setNextBlockTimestamp({
  timestamp: 1671744314n // [!code focus]
})
```

## Notes

- The next Block `timestamp` cannot be lesser than the current Block `timestamp`.