# setBlockTimestampInterval

Similar to [`increaseTime`](/docs/actions/test/increaseTime), but sets a block timestamp `interval`. The timestamp of future blocks will be computed as `lastBlock_timestamp` + `interval`.

## Import 

```ts
import { setBlockTimestampInterval } from 'viem/test'
```

## Usage

```ts
import { setBlockTimestampInterval } from 'viem/test'
import { testClient } from '.'
 
await setBlockTimestampInterval(testClient, { // [!code focus:4]
  interval: 5
})
```

## Parameters

### interval

- **Type:** `number`

```ts
await setBlockTimestampInterval(testClient, {
  interval: 1 // [!code focus]
})
```