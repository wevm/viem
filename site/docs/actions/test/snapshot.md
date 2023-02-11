# snapshot

Snapshot the state of the blockchain at the current block.

## Import 

```ts
import { snapshot } from 'viem/test'
```

## Usage

```ts
import { snapshot } from 'viem/test'
import { testClient } from '.'
 
const id = await snapshot(testClient) // [!code focus]
```

## Returns

ID of the snapshot that was created.