# inspectTxpool

Returns a summary of all the transactions currently pending for inclusion in the next block(s), as well as the ones that are being scheduled for future execution only. [Read more](https://geth.ethereum.org/docs/interacting-with-geth/rpc/ns-txpool).

## Import 

```ts
import { inspectTxpool } from 'viem/test'
```

## Usage

```ts
import { inspectTxpool } from 'viem/test'
import { testClient } from '.'
 
const data = await inspectTxpool(testClient) // [!code focus]
```

## Returns

Transaction pool inspection data. [See here](https://geth.ethereum.org/docs/interacting-with-geth/rpc/ns-txpool).
