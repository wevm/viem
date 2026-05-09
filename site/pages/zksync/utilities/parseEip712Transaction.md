---
description: Parse EIP712 transaction.
---

# parseEip712Transaction

Parses a serialized EIP712 transaction.

## Import

```ts
import { parseEip712Transaction } from 'viem/zksync'
```

## Usage

```ts
import { parseEip712Transaction } from 'viem/zksync'

const serializedTransaction =
    '0x71f87f8080808094a61464658afeaf65cccaafd3a512b69a83b77618830f42408001a073a20167b8d23b610b058c05368174495adf7da3a4ed4a57eb6dbdeb1fafc24aa02f87530d663a0d061f69bb564d2c6fb46ae5ae776bbd4bd2a2a4478b9cd1b42a82010e9436615cf349d7f6344891b1e7ca7c72883f5dc04982c350c080c0'
const transaction = parseEip712Transaction(serializedTransaction)
```

## Returns

`ZksyncTransactionSerializableEIP712`

The ZKsync EIP712 transaction.

## Parameters

### tx

- **Type:** [`Hex`](/docs/glossary/types#hex)

The serialized EIP712 transaction.

```ts
const serializedTransaction =
    '0x71f87f8080808094a61464658afeaf65cccaafd3a512b69a83b77618830f42408001a073a20167b8d23b610b058c05368174495adf7da3a4ed4a57eb6dbdeb1fafc24aa02f87530d663a0d061f69bb564d2c6fb46ae5ae776bbd4bd2a2a4478b9cd1b42a82010e9436615cf349d7f6344891b1e7ca7c72883f5dc04982c350c080c0'
const transaction = parseEip712Transaction(serializedTransaction)
```