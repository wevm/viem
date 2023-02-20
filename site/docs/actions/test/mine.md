# mine

Mine a specified number of blocks.

## Usage

```ts
import { testClient } from '.'
 
await testClient.mine({ // [!code focus:4]
  blocks: 1
})
```

## Parameters

### blocks

- **Type:** `number`

Number of blocks to mine.

```ts
await testClient.mine({
  blocks: 1 // [!code focus:4]
})
```

### interval (optional)

- **Type:** `number`
- **Default:** `1`

Interval between each block in seconds.

```ts
await testClient.mine({
  blocks: 10,
  interval: 4 // [!code focus]
})
```