# waitForTransactionReceipt

Waits for the [Transaction](/TODO) to be included on a [Block](/TODO) (one confirmation), and then returns the [Transaction Receipt](/TODO). If the Transaction reverts, then the action will throw an error.

<<<<<<< Updated upstream
The `waitForTransactionReceipt` action additionally supports replacement detection (ie. sped up transactions).
=======
The `waitForTransactionReceipt` action additionally supports Replacement detection (ie. sped up Transactions).
>>>>>>> Stashed changes

## Import

```ts
import { waitForTransactionReceipt } from 'viem'
```

## Usage

```ts
import { waitForTransactionReceipt } from 'viem'
import { publicClient } from '.'
 
const transaction = await waitForTransactionReceipt( // [!code focus:99]
  publicClient,
  { hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d' }
)
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

### confirmations (optional)

- **Type:** `number`
- **Default:** `1`

The number of confirmations (blocks that have passed) to wait before resolving.

```ts
const transaction = await waitForTransactionReceipt(
  publicClient,
  { 
    confirmations: 5, // [!code focus:1]
    hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d' 
  }
)
```

### onReplaced (optional)

- **Type:** `({ reason: 'replaced' | 'repriced' | 'cancelled', replacedTransaction: Transaction, transaction: Transaction, transactionReceipt: TransactionReceipt }) => void`

Optional callback to emit if the transaction has been replaced.

```ts
const transaction = await waitForTransactionReceipt(
  publicClient,
  { 
    hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
    onReplaced: replacement => console.log(replacement) // [!code focus:1]
  }
)
```

### pollingInterval (optional)

- **Type:** `number`

Polling frequency (in ms). Defaults to the Client's `pollingInterval` config.

```ts
const transaction = await waitForTransactionReceipt(
  publicClient,
  { 
    hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
    pollingInterval: 12_000, // [!code focus:1]
  }
)
```

### timeout (optional)

- **Type:** `number`

Optional timeout (in milliseconds) to wait before stopping polling.

```ts
const transaction = await waitForTransactionReceipt(
  publicClient,
  { 
    hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
    timeout: 60_000, // [!code focus:1]
  }
)
```

### Notes

- Transactions can be replaced when a user modifies their transaction in their wallet (to speed up or cancel). Transactions are replaced when they are sent from the same nonce.
<<<<<<< Updated upstream
- There are 3 types of transaction replacement reasons:
  - `repriced`: The gas price has been modified (ie. different `maxFeePerGas`)
  - `cancelled`: The transaction has been cancelled (ie. `value === 0n`)
  - `replaced`: The transaction has been replaced (ie. different `value` or `data`)
=======
- There are 3 types of Transaction Replacement reasons:
  - `repriced`: The gas price has been modified (ie. different `maxFeePerGas`)
  - `cancelled`: The Transaction has been cancelled (ie. `value === 0n`)
  - `replaced`: The Transaction has been replaced (ie. different `value` or `data`)
>>>>>>> Stashed changes


## Example

<iframe frameborder="0" width="100%" height="500px" src="https://replit.com/@jxom/TODO"></iframe>