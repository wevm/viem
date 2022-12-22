# getTransaction

Returns information about a transaction given a hash or block identifier.

## Import

```ts
import { getTransaction } from 'viem'
```

## Usage

```ts
import { getTransaction } from 'viem'
import { publicClient } from '.'
 
const transaction = await getTransaction(publicClient, { // [!code focus:99]
  hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d'
})
/**
 * {
 *  blockHash: '0xaf1dadb8a98f1282e8f7b42cc3da8847bfa2cf4e227b8220403ae642e1173088',
 *  blockNumber: 15132008n,
 *  from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
 *  ...
 * }
 */
```

## Returns

[`Transaction`](/TODO)

The transaction information.

## Configuration

### hash (optional)

- **Type:** `'0x${string}'`

Get information about a transaction given a transaction hash.

```ts
const transaction = await getTransaction(publicClient, {
  hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d' // [!code focus]
})
```

### blockHash (optional)

- **Type:** `'0x${string}'`

Get information about a transaction given a block hash (and index).

```ts
const transaction = await getTransaction(publicClient, {
  blockHash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d', // [!code focus:2]
  index: 0
})
```

### blockNumber (optional)

- **Type:** `'0x${string}'`

Get information about a transaction given a block number (and index).

```ts
const transaction = await getTransaction(publicClient, {
  blockNumber: 69420n, // [!code focus:2]
  index: 0
})
```

### blockTag (optional)

- **Type:** `'latest' | 'earliest' | 'pending' | 'safe' | 'finalized'`

Get information about a transaction given a block tag (and index).

```ts
const transaction = await getTransaction(publicClient, {
  blockTag: 'safe', // [!code focus:2]
  index: 0
})
```

### index (optional)

- **Type:** `number`

An index to be used with a block identifier (number, hash or tag).

```ts
const transaction = await getTransaction(publicClient, {
  blockTag: 'safe',
  index: 0 // [!code focus]
})
```


## Notes

- A [Transaction](#gettransaction) is not to be confused with a [Transaction Receipt](/TODO). A Transaction is a **message** sent by an account that is broadcast to the network, whereas a Transaction Receipt is the **confirmation** that the transaction has been processed and included in a block on the blockchain. You can get a Transaction Receipt using [`getTransactionReceipt`](/TODO).

## Example

<iframe frameborder="0" width="100%" height="500px" src="https://replit.com/@jxom/getTransaction?embed=true"></iframe>