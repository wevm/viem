# enableTraces

Enable call traces for transactions that are returned to the user when they execute a transaction (instead of just the transaction hash / receipt).

## Import 

```ts
import { enableTraces } from 'viem'
```

## Usage

```ts
import { enableTraces } from 'viem'
import { testClient } from '.'
 
await enableTraces(testClient) // [!code focus:4]
```
