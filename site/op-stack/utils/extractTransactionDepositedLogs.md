---
outline: deep
head:
  - - meta
    - property: og:title
      content: extractTransactionDepositedLogs
  - - meta
    - name: description
      content: Extracts "TransactionDeposited" logs from a set of opaque logs.
  - - meta
    - property: og:description
      content: Extracts "TransactionDeposited" logs from a set of opaque logs.
---

# extractTransactionDepositedLogs

Extracts `TransactionDeposited` logs from a set of opaque logs.

## Usage

::: code-group

```ts [example.ts]
import { extractTransactionDepositedLogs } from 'viem/op-stack'
import { mainnetClient } from './config'

const receipt = await getTransactionReceipt(mainnetClient, {
  hash: '0xec23b2ba4bc59ba61554507c1b1bc91649e6586eb2dd00c728e8ed0db8bb37ea',
})

const logs = extractTransactionDepositedLogs({ logs: receipt.logs }) // [!code hl]
// [{ args: { ... }, eventName: 'TransactionDeposited', ... }, ...] // [!code hl]
```

```ts [config.ts]
import { createClient, http } from 'viem'
import { mainnet } from 'viem/chains'

export const mainnetClient = createClient({
  chain: mainnet,
  transport: http()
})
```

:::

## Returns

`Logs[]`

Extracted `TransactionDeposited` logs.

## Parameters

### logs

- **Type:** `Log[]`

A set of opaque logs.

```ts
const logs = extractTransactionDepositedLogs({
  logs: [/* ... */] // [!code focus]
})
```