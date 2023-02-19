# setNextBlockTimestamp

Sets the next block's timestamp.

## Usage

```ts
import { testClient } from '.'
 
await testClient.setNextBlockTimestamp({ // [!code focus:4]
  timestamp: 1671744314
})
```

## Parameters

### timestamp

- **Type:** `number`

```ts
await testClient.setNextBlockTimestamp({
  timestamp: 1671744314 // [!code focus]
})
```

## Notes

- The next Block `timestamp` cannot be lesser than the current Block `timestamp`.