---
head:
  - - meta
    - property: og:title
      content: setNextBlockTimestamp
  - - meta
    - name: description
      content: Sets the next block's timestamp.
  - - meta
    - property: og:description
      content: Sets the next block's timestamp.

---

# setNextBlockTimestamp

Sets the next block's timestamp.

## Usage

```ts
import { testClient } from '.'
 
await testClient.setNextBlockTimestamp({ // [!code focus:4]
  timestamp: 1671744314n
})
```

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