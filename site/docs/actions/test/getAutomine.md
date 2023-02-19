# getAutomine

Returns the automatic mining status of the node.

## Usage

```ts
import { testClient } from '.'
 
const isAutomining = await testClient.getAutomine() // [!code focus]
```

## Returns

`boolean`

Whether or not the node is auto mining.
