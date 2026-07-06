---
description: Extracts "TransactionDeposited" logs from an opaque array of logs.
---

# extractTransactionDepositedLogs

Extracts `TransactionDeposited` logs from an opaque array of logs.

## Import
```ts
import { extractTransactionDepositedLogs } from 'viem'
```

## Usage

```ts
import { extractTransactionDepositedLogs } from 'viem'

const receipt = await client.getTransactionReceipt({
  hash: '0xc9c0361bc3da9cd3560e48b469d0d6aac0e633e4897895edfd26a287f7c578ec',
})

const logs = extractTransactionDepositedLogs(receipt)
// [
//   { args: { ... }, blockHash: '0x...', eventName: 'TransactionDeposited'  },
//   { args: { ... }, blockHash: '0x...', eventName: 'TransactionDeposited'  },
//   { args: { ... }, blockHash: '0x...', eventName: 'TransactionDeposited'  },
// ]
```

## Returns

`Log[]`

The `TransactionDeposited` logs.

## Parameters

### logs

- **Type:** `Log[]`

An array of opaque logs.

```ts
const logs = extractTransactionDepositedLogs({ 
  logs: receipt.logs // [!code focus]
})
```
