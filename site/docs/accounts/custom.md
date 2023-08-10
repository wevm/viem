---
head:
  - - meta
    - property: og:title
      content: Custom Account
  - - meta
    - name: description
      content: A function to create a Custom Account.
  - - meta
    - property: og:description
      content: A function to create a Custom Account.

---

# Custom Account

A Custom Account is an interface that has the ability to sign transactions and messages with your own custom implementation of the signable methods.

## Import

```ts
import { toAccount } from 'viem/accounts'
```

## Usage

```ts
import { createWalletClient, http } from 'viem'
import {  // [!code focus:7]
  signMessage, 
  signTransaction, 
  signTypedData, 
  privateKeyToAddress,
  toAccount 
} from 'viem/accounts'
import { mainnet } from 'viem/chains'

const privateKey = '0x...' // [!code focus:13]
const account = toAccount({
  address: getAddress(privateKey),
  async signMessage({ message }) {
    return signMessage({ message, privateKey })
  },
  async signTransaction(transaction, { serializer }) {
    return signTransaction({ privateKey, transaction, serializer })
  },
  async signTypedData(typedData) {
    return signTypedData({ ...typedData, privateKey })
  },
})

const client = createWalletClient({
  account,
  chain: mainnet,
  transport: http()
})
```

## Parameters

### address

- **Type:** `Address`

The Address of the Account.

```ts
const account = toAccount({
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // [!code focus]
  async signMessage({ message }) {
    return signMessage({ message, privateKey })
  },
  async signTransaction(transaction, { serializer }) {
    return signTransaction({ privateKey, transaction, serializer })
  },
  async signTypedData(typedData) {
    return signTypedData({ ...typedData, privateKey })
  },
})
```

### signMessage

Function to sign a message in [EIP-191 format](https://eips.ethereum.org/EIPS/eip-191).

```ts
const account = toAccount({
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',

  async signMessage({ message }) { // [!code focus:3]
    return signMessage({ message, privateKey })
  },
  async signTransaction(transaction, { serializer }) {
    return signTransaction({ privateKey, transaction, serializer })
  },
  async signTypedData(typedData) {
    return signTypedData({ ...typedData, privateKey })
  },
})
```

### signTransaction

Function to sign a transaction.

```ts
const account = toAccount({
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  async signMessage({ message }) {
    return signMessage({ message, privateKey })
  },
  async signTransaction(transaction, { serializer }) {  // [!code focus:3]
    return signTransaction({ privateKey, transaction, serializer })
  },
  async signTypedData(typedData) {
    return signTypedData({ ...typedData, privateKey })
  },
})
```

### signTypedData

Function to sign [EIP-712](https://eips.ethereum.org/EIPS/eip-712) typed data.

```ts
const account = toAccount({
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  async signMessage({ message }) {
    return signMessage({ message, privateKey })
  },
  async signTransaction(transaction, { serializer }) {
    return signTransaction({ privateKey, transaction, serializer })
  },
  async signTypedData(typedData) {  // [!code focus:3]
    return signTypedData({ ...typedData, privateKey })
  },
})
```
