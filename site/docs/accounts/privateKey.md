---
head:
  - - meta
    - property: og:title
      content: Private Key Account
  - - meta
    - name: description
      content: A function to create a Private Key Account.
  - - meta
    - property: og:description
      content: A function to create a Private Key Account.

---

# Private Key Account

A Private Key Account is an interface that has the ability to sign transactions and messages with a given private key.

## Import

```ts
import { privateKeyToAccount } from 'viem'
```

## Usage

To initialize a Private Key Account, you will need to pass a private key to `privateKeyToAccount`:

```ts
import { 
  createWalletClient,
  custom,
  privateKeyToAccount
} from 'viem'
import { mainnet } from 'viem/chains'

const account = privateKeyToAccount('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80') // [!code focus]

const client = createWalletClient({
  account,
  chain: mainnet,
  transport: custom(window.ethereum)
})
```

> Note: the above is a valid private key, but it is not a "real" private key. Please do not use it for anything other than testing.

## Parameters

### privateKey

- **Type:** `Hex`

The private key to use for the Account.