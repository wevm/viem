---
head:
  - - meta
    - property: og:title
      content: setAutomine
  - - meta
    - name: description
      content: Enables or disables the automatic mining of new blocks with each new transaction submitted to the network.
  - - meta
    - property: og:description
      content: Enables or disables the automatic mining of new blocks with each new transaction submitted to the network.

---

# setAutomine

Enables or disables the automatic mining of new blocks with each new transaction submitted to the network.

## Usage

```ts
import { testClient } from '.'
 
await testClient.setAutomine(true) // [!code focus]
```

## Parameters

### enabled

- **Type:** `boolean`

```ts
await testClient.setAutomine(false) // [!code focus]
```