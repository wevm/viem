---
head:
  - - meta
    - property: og:title
      content: removeBlockTimestampInterval
  - - meta
    - name: description
      content: Removes `setBlockTimestampInterval` if it exists.
  - - meta
    - property: og:description
      content: Removes `setBlockTimestampInterval` if it exists.

---

# removeBlockTimestampInterval

Removes `setBlockTimestampInterval` if it exists.

## Usage

```ts
import { testClient } from '.'
 
await testClient.removeBlockTimestampInterval() // [!code focus]
```