---
description: Retrieves a Transaction Receipt for a given Transaction hash.
---

# waitForTransactionReceipt

Waits for the [Transaction](/docs/glossary/terms#transaction) to be included on a [Block](/docs/glossary/terms#block) (one confirmation), and then returns the [Transaction Receipt](/docs/glossary/terms#transaction-receipt).

The `waitForTransactionReceipt` action additionally supports Replacement detection (e.g. sped up Transactions).

## Usage

:::code-group

```ts twoslash [example.ts]
import { publicClient } from './client'

const transaction = await publicClient.waitForTransactionReceipt( // [!code focus:99]
  { hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d' }
)
// @log: {
// @log:  blockHash: '0xaf1dadb8a98f1282e8f7b42cc3da8847bfa2cf4e227b8220403ae642e1173088',
// @log:  blockNumber: 15132008n,
// @log:  from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
// @log:  ...
// @log:  status: 'success',
// @log: }
```

```ts twoslash [client.ts] filename="client.ts"
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
})
```

:::

## Returns

[`TransactionReceipt`](/docs/glossary/types#transactionreceipt)

The transaction receipt.

## Parameters

### confirmations (optional)

- **Type:** `number`
- **Default:** `1`

The number of confirmations (blocks that have passed) to wait before resolving.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const transaction = await publicClient.waitForTransactionReceipt(
  { 
    confirmations: 5, // [!code focus:1]
    hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d' 
  }
)
```

### onReplaced (optional)

- **Type:** `({ reason: 'replaced' | 'repriced' | 'cancelled', replacedTransaction: Transaction, transaction: Transaction, transactionReceipt: TransactionReceipt }) => void`

Optional callback to emit if the transaction has been replaced.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const transaction = await publicClient.waitForTransactionReceipt(
  { 
    hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
    onReplaced: replacement => console.log(replacement) // [!code focus:1]
  }
)
```

### pollingInterval (optional)

- **Type:** `number`

Polling frequency (in ms). Defaults to the Client's `pollingInterval` config.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const transaction = await publicClient.waitForTransactionReceipt(
  { 
    hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
    pollingInterval: 12_000, // [!code focus:1]
  }
)
```

### retryCount (optional)

- **Type:** `number`
- **Default:** `6`

Number of times to retry if the transaction or block is not found.

```ts
const transaction = await publicClient.waitForTransactionReceipt(
  { 
    hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
    retryCount: 3, // [!code focus:1]
  }
)
```

### retryDelay (optional)

- **Type:** `number | (({ count: number; error: Error }) => number)`
- **Default:** `({ count }) => ~~(1 << count) * 200` (exponential backoff)

Time to wait (in ms) between retries.

```ts
const transaction = await publicClient.waitForTransactionReceipt(
  { 
    hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
    retryDelay: 10_000, // [!code focus:1]
  }
)
```

### timeout (optional)

- **Type:** `number`
- **Default:** `180_000`

Optional timeout (in milliseconds) to wait before stopping polling.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const transaction = await publicClient.waitForTransactionReceipt(
  { 
    hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
    timeout: 60_000, // [!code focus:1]
  }
)
```

### Notes

- Transactions can be replaced when a user modifies their transaction in their wallet (to speed up or cancel). Transactions are replaced when they are sent from the same nonce.
- There are 3 types of Transaction Replacement reasons:
  - `repriced`: The gas price has been modified (ie. different `maxFeePerGas`)
  - `cancelled`: The Transaction has been cancelled (ie. `value === 0n`)
  - `replaced`: The Transaction has been replaced (ie. different `value` or `data`)

## Live Example

Check out the usage of `waitForTransactionReceipt` in the live [Sending Transactions Example](https://stackblitz.com/github/wevm/viem/tree/main/examples/transactions_sending-transactions) below.

<iframe frameBorder="0" width="100%" height="500px" src="https://stackblitz.com/github/wevm/viem/tree/main/examples/transactions_sending-transactions?embed=1&file=index.ts&hideNavigation=1&hideDevTools=true&terminalHeight=0&ctl=1"></iframe>


## JSON-RPC Methods

- Polls [`eth_getTransactionReceipt`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getTransactionReceipt) on each block until it has been processed.
- If a Transaction has been replaced:
  - Calls [`eth_getBlockByNumber`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getblockbynumber) and extracts the transactions
  - Checks if one of the Transactions is a replacement
  - If so, calls [`eth_getTransactionReceipt`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getTransactionReceipt).