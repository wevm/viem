# getTxpoolStatus

Returns a summary of all the transactions currently pending for inclusion in the next block(s), as well as the ones that are being scheduled for future execution only. [Read more](https://geth.ethereum.org/docs/interacting-with-geth/rpc/ns-txpool).

## Import 

```ts
import { getTxpoolStatus } from 'viem/test'
```

## Usage

```ts
import { getTxpoolStatus } from 'viem/test'
import { testClient } from '.'
 
const status = await getTxpoolStatus(testClient) // [!code focus]
```

## Returns

Transaction pool status. [See here](https://geth.ethereum.org/docs/interacting-with-geth/rpc/ns-txpool).
