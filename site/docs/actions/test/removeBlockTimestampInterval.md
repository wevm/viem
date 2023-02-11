# removeBlockTimestampInterval

Removes `setBlockTimestampInterval` if it exists.

## Import 

```ts
import { removeBlockTimestampInterval } from 'viem/test'
```

## Usage

```ts
import { removeBlockTimestampInterval } from 'viem/test'
import { testClient } from '.'
 
await removeBlockTimestampInterval(testClient) // [!code focus]
```