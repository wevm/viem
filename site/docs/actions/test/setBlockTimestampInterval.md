---
head:
  - - meta
    - property: og:title
      content: setBlockTimestampInterval
  - - meta
    - name: description
      content: Sets the block's timestamp interval.
  - - meta
    - property: og:description
      content: Sets the block's timestamp interval.

---

# setBlockTimestampInterval

Similar to [`increaseTime`](/docs/actions/test/increaseTime), but sets a block timestamp `interval`. The timestamp of future blocks will be computed as `lastBlock_timestamp` + `interval`.

## Usage

```ts
import { testClient } from '.'
 
await testClient.setBlockTimestampInterval({ // [!code focus:4]
  interval: 5
})
```

## Parameters

### interval

- **Type:** `number`

```ts
await testClient.setBlockTimestampInterval({
  interval: 1 // [!code focus]
})
```