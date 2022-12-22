# sendUnsignedTransaction

Executes a transaction regardless of the signature.

## Import 

```ts
import { sendUnsignedTransaction } from 'viem'
```

## Usage

```ts
import { sendUnsignedTransaction } from 'viem'
import { testClient } from '.'
 
const { hash } = await sendUnsignedTransaction(testClient, { // [!code focus:99]
  request: {
    from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: 1000000000000000000n
  }
})
// { hash: '0x...' }
```

## Returns

`'0x${string}'[]`

The transaction hash.

## Configuration

### request

- **Type:** [`TransactionRequest`](/TODO)

The transaction request.

```ts
const { hash } = await sendUnsignedTransaction(testClient, { 
  request: { // [!code focus:5]
    from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: 1000000000000000000n
  }
})
```