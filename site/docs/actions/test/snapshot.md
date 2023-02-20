# snapshot

Snapshot the state of the blockchain at the current block.

## Usage

```ts
import { testClient } from '.'
 
const id = await testClient.snapshot() // [!code focus]
```

## Returns

ID of the snapshot that was created.