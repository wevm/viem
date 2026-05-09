---
description: Computes source hash of a deposit transaction.
---

# getSourceHash

Computes the [source hash](https://github.com/ethereum-optimism/optimism/blob/develop/specs/deposits.md#source-hash-computation) of a deposit transaction.

## Import
```ts
import { getSourceHash } from 'viem'
```

## Usage

```ts
import { getSourceHash } from 'viem'

// User Deposit
const sourceHash = getSourceHash({
  domain: 'userDeposit',
  l1BlockHash:
    '0x9ba3933dc6ce43c145349770a39c30f9b647f17668f004bd2e05c80a2e7262f7',
  l1LogIndex: 196,
})

// L1 attributes deposited
const sourceHash = getSourceHash({
  domain: 'l1InfoDeposit',
  l1BlockHash:
    '0x9ba3933dc6ce43c145349770a39c30f9b647f17668f004bd2e05c80a2e7262f7',
  sequenceNumber: 1,
})
```

## Returns

`Hex`

The source hash of the deposit transaction.

## Parameters

### domain

- **Type:** `"userDeposit" | "l1InfoDeposit"`

The domain of the deposit transaction.

```ts
const sourceHash = getSourceHash({
  domain: 'userDeposit', // [!code focus]
  l1BlockHash:
    '0x9ba3933dc6ce43c145349770a39c30f9b647f17668f004bd2e05c80a2e7262f7',
  l1LogIndex: 196,
})
```

### l1BlockHash

- **Type:** `Hex`

The hash of the L1 block the deposit transaction was included in.

```ts
const sourceHash = getSourceHash({
  domain: 'userDeposit',
  l1BlockHash:
    '0x9ba3933dc6ce43c145349770a39c30f9b647f17668f004bd2e05c80a2e7262f7', // [!code focus]
  l1LogIndex: 196,
})
```

### l1LogIndex

- **Type:** `number`

The index of the L1 log. **Only required for `"userDeposit"` domain.**

```ts
const sourceHash = getSourceHash({
  domain: 'userDeposit',
  l1BlockHash:
    '0x9ba3933dc6ce43c145349770a39c30f9b647f17668f004bd2e05c80a2e7262f7',
  l1LogIndex: 196, // [!code focus]
})
```

### sequenceNumber

- **Type:** `number`

The sequence number (difference between L2 block number and first L2 epoch block number). **Only required for `"l1InfoDeposit"` domain.**

```ts
const sourceHash = getSourceHash({
  domain: 'l1InfoDeposit',
  l1BlockHash:
    '0x9ba3933dc6ce43c145349770a39c30f9b647f17668f004bd2e05c80a2e7262f7',
  sequenceNumber: 1, // [!code focus]
})
```