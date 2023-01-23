# mine

Mine a specified number of blocks.

## Import 

```ts
import { mine } from 'viem'
```

## Usage

```ts
import { mine } from 'viem'
import { testClient } from '.'
 
await mine(testClient, { // [!code focus:4]
  blocks: 1
})
```

## Parameters

### blocks

- **Type:** `number`

Number of blocks to mine.

```ts
await mine(testClient, {
  blocks: 1 // [!code focus:4]
})
```

### interval (optional)

- **Type:** `number`
- **Default:** `1`

Interval between each block in seconds.

```ts
await mine(testClient, {
  blocks: 10,
  interval: 4 // [!code focus]
})
```