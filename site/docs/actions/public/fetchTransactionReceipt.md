# fetchTransactionReceipt

Returns the transaction receipt given a transaction hash.

## Import

```ts
import { fetchTransactionReceipt } from 'viem'
```

## Usage

```ts
import { fetchTransactionReceipt } from 'viem'
import { publicClient } from '.'
 
const transaction = await fetchTransactionReceipt(publicClient, { // [!code focus:99]
  hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d'
})
/**
 * {
 *  blockHash: '0xaf1dadb8a98f1282e8f7b42cc3da8847bfa2cf4e227b8220403ae642e1173088',
 *  blockNumber: 15132008n,
 *  from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
 *  ...
 *  status: 'success',
 * }
 */
```

## Returns

[`TransactionReceipt`](/TODO)

The transaction receipt.

## Configuration

### hash

- **Type:** `'0x${string}'`

A transaction hash.

```ts
const transaction = await fetchTransactionReceipt(publicClient, {
  hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d' // [!code focus]
})
```


## Notes

- A [Transaction Receipt](/TODO) is not to be confused with a [Transaction](/TODO).a Transaction Receipt is the **confirmation** that the transaction has been processed and included in a block on the blockchain, whereas a Transaction is a **message** sent by an account that is broadcast to the network. You can fetch a Transaction using [`fetchTransaction`](/TODO).

## Example

TODO