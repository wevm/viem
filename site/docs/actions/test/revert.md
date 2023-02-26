---
head:
  - - meta
    - property: og:title
      content: revert
  - - meta
    - name: description
      content: Revert the state of the blockchain at the current block.
  - - meta
    - property: og:description
      content: Revert the state of the blockchain at the current block.

---

# revert

Revert the state of the blockchain at the current block.

## Usage

```ts
import { testClient } from '.'
 
await testClient.revert({ // [!code focus:99]
  id: '0x...'
})
```

## Parameters

### id

- **Type:** ``"0x${string}"``

The snapshot ID.

```ts
await testClient.revert({
  id: '0x...' // [!code focus]
})
```