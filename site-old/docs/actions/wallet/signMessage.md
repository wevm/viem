---
head:
  - - meta
    - property: og:title
      content: signMessage
  - - meta
    - name: description
      content: Signs a message with the Account's private key.
  - - meta
    - property: og:description
      content: Signs a message with the Account's private key.

---

# signMessage

Calculates an Ethereum-specific signature in [EIP-191 format](https://eips.ethereum.org/EIPS/eip-191): `keccak256("\x19Ethereum Signed Message:\n" + len(message) + message))`.

With the calculated signature, you can:
- use [`verifyMessage`](/docs/utilities/verifyMessage) to verify the signature,
- use [`recoverMessageAddress`](/docs/utilities/recoverMessageAddress) to recover the signing address from a signature.

## Usage

::: code-group

```ts [example.ts]
import { account, walletClient } from './config'
 
const signature = await walletClient.signMessage({ // [!code focus:99]
  account,
  message: 'hello world',
})
// "0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b"

const signature = await walletClient.signMessage({
  account,
  // Hex data representation of message.
  message: { raw: '0x68656c6c6f20776f726c64' },
})
// "0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b"
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

:::

### Account Hoisting

If you do not wish to pass an `account` to every `signMessage`, you can also hoist the Account on the Wallet Client (see `config.ts`).

[Learn more](/docs/clients/wallet.html#withaccount).

::: code-group

```ts [example.ts]
import { walletClient } from './config'
 
const signature = await walletClient.signMessage({ // [!code focus:99]
  message: 'hello world',
})
// "0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b"
```

```ts {4-6,9} [config.ts (JSON-RPC Account)]
import { createWalletClient, custom } from 'viem'

// Retrieve Account from an EIP-1193 Provider.
const [account] = await window.ethereum.request({ 
  method: 'eth_requestAccounts' 
})

export const walletClient = createWalletClient({
  account,
  transport: custom(window.ethereum)
})
```

```ts {5} [config.ts (Local Account)]
import { createWalletClient, custom } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

export const walletClient = createWalletClient({
  account: privateKeyToAccount('0x...'),
  transport: custom(window.ethereum)
})
```

:::

## Returns

[`Hex`](/docs/glossary/types#hex)

The signed message.

## Parameters

### account

- **Type:** `Account | Address`

Account to use for signing.

Accepts a [JSON-RPC Account](/docs/clients/wallet#json-rpc-accounts) or [Local Account (Private Key, etc)](/docs/clients/wallet#local-accounts-private-key-mnemonic-etc).

```ts
const signature = await walletClient.signMessage({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', // [!code focus:1]
  message: 'hello world',
})
```

### message

- **Type:** `string | { raw: Hex | ByteArray }`

Message to sign.

By default, viem signs the UTF-8 representation of the message.

```ts
const signature = await walletClient.signMessage({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  message: 'hello world', // [!code focus:1]
})
```

To sign the data representation of the message, you can use the `raw` attribute.

```ts
const signature = await walletClient.signMessage({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  message: { raw: '0x68656c6c6f20776f726c64' }, // [!code focus:1]
})
```

## JSON-RPC Methods

- JSON-RPC Accounts:
  - [`personal_sign`](https://docs.metamask.io/guide/signing-data.html#personal-sign)
- Local Accounts
  - Signs locally. No JSON-RPC request.
