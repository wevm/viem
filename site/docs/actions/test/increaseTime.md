# increaseTime

Jump forward in time by the given amount of time, in seconds.

## Usage

```ts
import { testClient } from '.'
 
await testClient.increaseTime({ // [!code focus:4]
  seconds: 420
})
```

## Parameters

### seconds

- **Type:** `number`

The amount of seconds to jump forward in time.

```ts
await testClient.increaseTime({
  seconds: 20 // [!code focus]
})
```