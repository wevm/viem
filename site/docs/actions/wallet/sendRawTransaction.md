---
head:
  - - meta
    - property: og:title
      content: sendRawTransaction
  - - meta
    - name: description
      content: Sends a signed transaction to the network
  - - meta
    - property: og:description
      content: Sends a signed transaction to the network

---

# sendRawTransaction

Sends a **signed** transaction to the network. Can be used with both [Public Clients](/docs/clients/public) and [Wallet Clients](/docs/clients/wallet)

## Usage

::: code-group

```ts [example.ts]
import { account, walletClient } from './config'
 
const request = await walletClient.prepareTransactionRequest({
  account,
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: 1000000000000000000n
})

const signature = await walletClient.signTranasction(request)

const hash = await walletClient.sendRawTransaction(signature) // [!code focus]
```

```ts [config.ts]
import { createWalletClient, custom } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'

export const walletClient = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum)
})

// JSON-RPC Account
export const [account] = await walletClient.getAddresses()
// Local Account
export const account = privateKeyToAccount(...)
```

## Returns

[`Hash`](/docs/glossary/types#hash)

The [Transaction](/docs/glossary/terms#transaction) hash.

## Parameters

### serializedTransaction

- **Type:** `Hex`

The signed serialized transaction.

```ts
const signature = await walletClient.signTransaction({
  serializedTransaction: '0x02f850018203118080825208808080c080a04012522854168b27e5dc3d5839bab5e6b39e1a0ffd343901ce1622e3d64b48f1a04e00902ae0502c4728cbf12156290df99c3ed7de85b1dbfe20b5c36931733a33' // [!code focus]
})
```
