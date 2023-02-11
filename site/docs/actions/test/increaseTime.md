# increaseTime

Jump forward in time by the given amount of time, in seconds.

## Import 

```ts
import { increaseTime } from 'viem/test'
```

## Usage

```ts
import { increaseTime } from 'viem/test'
import { testClient } from '.'
 
await increaseTime(testClient, { // [!code focus:4]
  seconds: 420
})
```

## Parameters

### seconds

- **Type:** `number`

The amount of seconds to jump forward in time.

```ts
await increaseTime(testClient, {
  seconds: 20 // [!code focus]
})
```