---
head:
  - - meta
    - property: og:title
      content: inspectTxpool
  - - meta
    - name: description
      content: Returns a summary of all the transactions currently pending for inclusion in the next block(s).
  - - meta
    - property: og:description
      content: Returns a summary of all the transactions currently pending for inclusion in the next block(s).

---

# inspectTxpool

Returns a summary of all the transactions currently pending for inclusion in the next block(s), as well as the ones that are being scheduled for future execution only. [Read more](https://geth.ethereum.org/docs/interacting-with-geth/rpc/ns-txpool).

## Usage

```ts
import { testClient } from '.'
 
const data = await testClient.inspectTxpool() // [!code focus]
```

## Returns

Transaction pool inspection data. [See here](https://geth.ethereum.org/docs/interacting-with-geth/rpc/ns-txpool).
