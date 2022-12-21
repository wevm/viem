# waitForTransaction

Waits for the [Transaction](/TODO) to be included on a [Block](/TODO) (one confirmation), and then returns the [Transaction Receipt](/TODO). If the Transaction reverts, then the action will throw an error.

The `waitForTransaction` action additionally supports:
- transaction replacement detection (ie. sped up transactions), and
- transaction revert reasons.

## Import

```ts
import { waitForTransaction } from 'viem'
```

## Usage

```ts
import { waitForTransaction } from 'viem'
import { publicClient } from '.'
 
const transaction = await waitForTransaction( // [!code focus:99]
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

The number of confirmations (blocks that have passed).

```ts
const transaction = await waitForTransaction(
  publicClient,
  { 
    confirmations: 5, // [!code focus:1]
    hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d' 
  }
)
```

### onReplaced (optional)

- **Type:** `({ reason: 'replaced' | 'repriced' | 'cancelled', receipt: TransactionReceipt, transaction: Transaction }) => void`

Optional callback to emit if the transaction has been replaced.

```ts
const transaction = await waitForTransaction(
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
const transaction = await waitForTransaction(
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
const transaction = await waitForTransaction(
  publicClient,
  { 
    hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
    timeout: 60_000, // [!code focus:1]
  }
)
```

## Example

<iframe frameborder="0" width="100%" height="500px" src="https://replit.com/@jxom/TODO"></iframe>