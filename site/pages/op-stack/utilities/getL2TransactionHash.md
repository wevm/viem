---
description: Computes the L2 transaction hash from an L1 "TransactionDeposited" log.
---

# getL2TransactionHash

Computes the L2 transaction hash from an L1 `TransactionDeposited` log.

:::warning

For the general case of retrieving an L2 transaction hash from an L1 transaction receipt, you probably want to use [getL2TransactionHashes](/op-stack/utilities/getL2TransactionHashes).

:::

## Import
```ts
import { getL2TransactionHash } from 'viem'
```

## Usage

```ts
import { extractTransactionDepositedLogs, getL2TransactionHash } from 'viem'

const receipt = await client.getTransactionReceipt({
  hash: '0xa08acae48f12243bccd7153c88d892673d5578cce4ee9988c0332e8bba47436b',
})

const [log] = extractTransactionDepositedLogs(receipt)

const l2Hash = getL2TransactionHash({ log }) // [!code hl]
```

## Returns

`Hex`

The L2 transaction hash.

## Parameters

### log

- **Type:** `Log`

An L1 `TransactionDeposited` log.

```ts
const l2Hash = getL2TransactionHash({ 
  log: { // [!code focus]
    args: { // [!code focus]
      from: '0x1a1E021A302C237453D3D45c7B82B19cEEB7E2e6', // [!code focus]
      opaqueData: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000045000000000000520800', // [!code focus]
      to: '0x1a1E021A302C237453D3D45c7B82B19cEEB7E2e6', // [!code focus]
      version: 0n, // [!code focus]
    }, // [!code focus]
    blockHash: '0x634c52556471c589f42db9131467e0c9484f5c73049e32d1a74e2a4ce0f91d57', // [!code focus]
    eventName: 'TransactionDeposited', // [!code focus]
    logIndex: 109, // [!code focus]
  } // [!code focus]
})
```
