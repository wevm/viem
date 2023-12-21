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

::: info
viem internally uses [`@noble/curves`](https://github.com/paulmillr/noble-curves), an **audited** implementation of [secp256k1](https://www.secg.org/sec2-v2.pdf), for our private key & signing implementation.
:::

## Import

```ts
import { privateKeyToAccount } from 'viem/accounts'
```

## Usage

To initialize a Private Key Account, you will need to pass a private key to `privateKeyToAccount`:

```ts
import { createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'

const account = privateKeyToAccount('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80') // [!code focus]

const client = createWalletClient({
  account,
  chain: mainnet,
  transport: http()
})
```

> Note: the above is a valid private key, but it is not a "real" private key. Please do not use it for anything other than testing.

### Generating Private Keys

You can generate a random private key using the `generatePrivateKey` function:

```ts
import { generatePrivateKey } from 'viem/accounts'

const privateKey = generatePrivateKey()
```

## Parameters

### privateKey

- **Type:** `Hex`

The private key to use for the Account.

## Returns

### address

The address of the Account.

```ts
const account = privateKeyToAccount('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80')

account.address
// '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
```

### signMessage

Calculates an Ethereum-specific signature in [EIP-191 format](https://eips.ethereum.org/EIPS/eip-191): `keccak256("\x19Ethereum Signed Message:\n" + len(message) + message))`.

```ts
const account = privateKeyToAccount('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80')

account.signMessage({ message: 'Hello World' })
// '0x7b2274797065223a226d657373616765222c226d657373616765223a2248656c6c6f20576f726c64227d'
```

### signTransaction

### signTypedData
