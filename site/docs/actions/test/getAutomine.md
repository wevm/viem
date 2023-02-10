# getAutomine

Returns the automatic mining status of the node.

## Import 

```ts
import { getAutomine } from 'viem/test'
```

## Usage

```ts
import { getAutomine } from 'viem/test'
import { testClient } from '.'
 
const isAutomining = await getAutomine(testClient) // [!code focus]
```

## Returns

`boolean`

Whether or not the node is auto mining.
