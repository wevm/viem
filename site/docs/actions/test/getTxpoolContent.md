# getTxpoolContent

Returns the details of all transactions currently pending for inclusion in the next block(s), as well as the ones that are being scheduled for future execution only. [Read more](https://geth.ethereum.org/docs/interacting-with-geth/rpc/ns-txpool).

## Import 

```ts
import { getTxpoolContent } from 'viem'
```

## Usage

```ts
import { getTxpoolContent } from 'viem'
import { testClient } from '.'
 
const content = await getTxpoolContent(testClient) // [!code focus]
```

## Returns

Transaction pool content. [See here](https://geth.ethereum.org/docs/interacting-with-geth/rpc/ns-txpool).
