---
description: Sends a signed transaction to the network
---

# sendRawTransaction

Sends a **signed** transaction to the network. Can be used with both [Public Clients](/docs/clients/public) and [Wallet Clients](/docs/clients/wallet)

## Usage

:::code-group

```ts twoslash [example.ts]
import { account, walletClient } from './config'
 
const request = await walletClient.prepareTransactionRequest({
  account,
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: 1000000000000000000n
})

const serializedTransaction = await walletClient.signTransaction(request)

const hash = await walletClient.sendRawTransaction({ serializedTransaction }) // [!code focus]
```

```ts twoslash [config.ts] filename="config.ts"
// [!include ~/snippets/walletClient.ts]

export const [account] = await walletClient.getAddresses()
// @log: ↑ JSON-RPC Account

// export const account = privateKeyToAccount(...)
// @log: ↑ Local Account
```

:::

## Returns

[`Hash`](/docs/glossary/types#hash)

The [Transaction](/docs/glossary/terms#transaction) hash.

## Parameters

### serializedTransaction

- **Type:** `Hex`

The signed serialized transaction.

```ts twoslash
// [!include ~/snippets/walletClient.ts]
// ---cut---
const signature = await walletClient.sendRawTransaction({
  serializedTransaction: '0x02f850018203118080825208808080c080a04012522854168b27e5dc3d5839bab5e6b39e1a0ffd343901ce1622e3d64b48f1a04e00902ae0502c4728cbf12156290df99c3ed7de85b1dbfe20b5c36931733a33' // [!code focus]
})
```
