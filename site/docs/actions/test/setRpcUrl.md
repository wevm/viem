---
head:
  - - meta
    - property: og:title
      content: setRpcUrl
  - - meta
    - name: description
      content: Sets the backend RPC URL.
  - - meta
    - property: og:description
      content: Sets the backend RPC URL.

---

# setRpcUrl

Sets the backend RPC URL.

## Usage

```ts
import { testClient } from '.'
 
await testClient.setRpcUrl('https://eth-mainnet.alchemyapi.io/v2') // [!code focus]
```