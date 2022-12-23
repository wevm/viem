# setNextBlockTimestamp

Sets the next block's timestamp.

## Import 

```ts
import { setNextBlockTimestamp } from 'viem'
```

## Usage

```ts
import { setNextBlockTimestamp } from 'viem'
import { testClient } from '.'
 
await setNextBlockTimestamp(testClient, { // [!code focus:4]
  timestamp: 1671744314
})
```

## Configuration

### timestamp

- **Type:** `number`

```ts
await setNextBlockTimestamp(testClient, {
  timestamp: 1671744314 // [!code focus]
})
```

## Notes

- The next Block `timestamp` cannot be lesser than the current Block `timestamp`.