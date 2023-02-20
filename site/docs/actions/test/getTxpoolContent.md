# getTxpoolContent

Returns the details of all transactions currently pending for inclusion in the next block(s), as well as the ones that are being scheduled for future execution only. [Read more](https://geth.ethereum.org/docs/interacting-with-geth/rpc/ns-txpool).

## Usage

```ts
import { testClient } from '.'
 
const content = await testClient.getTxpoolContent() // [!code focus]
```

## Returns

Transaction pool content. [See here](https://geth.ethereum.org/docs/interacting-with-geth/rpc/ns-txpool).
