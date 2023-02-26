---
head:
  - - meta
    - property: og:title
      content: getTxpoolStatus
  - - meta
    - name: description
      content: Returns a summary of all the transactions currently pending for inclusion in the next block(s).
  - - meta
    - property: og:description
      content: Returns a summary of all the transactions currently pending for inclusion in the next block(s).

---

# getTxpoolStatus

Returns a summary of all the transactions currently pending for inclusion in the next block(s), as well as the ones that are being scheduled for future execution only. [Read more](https://geth.ethereum.org/docs/interacting-with-geth/rpc/ns-txpool).

## Usage

```ts
import { testClient } from '.'
 
const status = await testClient.getTxpoolStatus() // [!code focus]
```

## Returns

Transaction pool status. [See here](https://geth.ethereum.org/docs/interacting-with-geth/rpc/ns-txpool).
