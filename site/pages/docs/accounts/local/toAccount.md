# toAccount [A function to create a Custom Account.]

Creates an Account from a custom signing implementation

## Import

```ts
import { toAccount } from 'viem/accounts'
```

## Usage

```ts
import { 
  signMessage, 
  signTransaction, 
  signTypedData, 
  privateKeyToAddress,
  toAccount 
} from 'viem/accounts'

const privateKey = '0x...'

const account = toAccount({ // [!code focus:15]
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
