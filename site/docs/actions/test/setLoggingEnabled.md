---
head:
  - - meta
    - property: og:title
      content: setLoggingEnabled
  - - meta
    - name: description
      content: Enable or disable logging on the test node network.
  - - meta
    - property: og:description
      content: Enable or disable logging on the test node network.

---

# setLoggingEnabled

Enable or disable logging on the test node network.

## Usage

```ts
import { testClient } from '.'
 
await testClient.setLoggingEnabled(true) // [!code focus]
```