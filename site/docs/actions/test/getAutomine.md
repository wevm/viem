---
head:
  - - meta
    - property: og:title
      content: getAutomine
  - - meta
    - name: description
      content: Returns the automatic mining status of the node.
  - - meta
    - property: og:description
      content: Returns the automatic mining status of the node.

---

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
