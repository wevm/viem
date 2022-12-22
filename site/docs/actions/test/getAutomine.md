# getAutomine

Returns the automatic mining status of the node.

## Import 

```ts
import { getAutomine } from 'viem'
```

## Usage

```ts
import { getAutomine } from 'viem'
import { testClient } from '.'
 
const isAutomining = await getAutomine(testClient) // [!code focus]
```

## Returns

`boolean`

Whether or not the node is auto mining.
