# getTransactionConfirmations

Returns the number of blocks passed (confirmations) since the transaction was processed on a block.

## Usage

```ts
import { publicClient } from '.'
 
const transactionReceipt = await publicClient.getTransactionReceipt({ hash: '...' })
const confirmations = await publicClient.getTransactionConfirmations({  // [!code focus:99]
  transactionReceipt
})
// 15n
```

You can also fetch confirmations by Transaction hash:

```ts
import { publicClient } from '.'

const confirmations = await publicClient.getTransactionConfirmations({  // [!code focus:99]
  hash: '0x...'
})
// 15n
```

## Returns

`bigint`

The number of blocks passed since the transaction was processed. If confirmations is `0`, then the Transaction has not been confirmed & processed yet.

## Parameters

### transactionReceipt

- **Type:** [`TransactionReceipt`](/docs/glossary/types#TODO)

The transaction receipt.

```ts
const balance = await publicClient.getTransactionConfirmations({
  transactionReceipt: { ... }, // [!code focus]
})
```

### hash

- **Type:** `0x${string}`

The hash of the transaction.

```ts
const balance = await publicClient.getTransactionConfirmations({
  hash: '0x...'  // [!code focus]
})
```

## Example

<iframe frameborder="0" width="100%" height="500px" src="https://replit.com/@jxom/getBlockNumber?embed=true"></iframe>