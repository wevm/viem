# setIntervalMining

Sets the automatic mining interval (in seconds) of blocks. Setting the interval to `0` will disable automatic mining.

## Usage

```ts
import { testClient } from '.'
 
await testClient.setIntervalMining({ // [!code focus:4]
  interval: 5
})
```

## Parameters

### interval

- **Type:** `number`

The mining interval (in seconds). Setting the interval to `0` will disable automatic mining.

```ts
await testClient.setIntervalMining({
  interval: 5 // [!code focus]
})
```