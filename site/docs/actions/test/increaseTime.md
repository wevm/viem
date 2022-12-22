# increaseTime

Jump forward in time by the given amount of time, in seconds.

## Import 

```ts
import { increaseTime } from 'viem'
```

## Usage

```ts
import { increaseTime } from 'viem'
import { testClient } from '.'
 
await increaseTime(testClient, { // [!code focus:4]
  seconds: 420
})
```

## Configuration

### seconds

- **Type:** `number`

The amount of seconds to jump forward in time.

```ts
await increaseTime(testClient, {
  seconds: 20 // [!code focus]
})
```