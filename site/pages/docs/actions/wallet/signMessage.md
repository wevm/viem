---
description: Signs a message with the Account's private key.
---

# signMessage

Calculates an Ethereum-specific signature in [EIP-191 format](https://eips.ethereum.org/EIPS/eip-191): `keccak256("\x19Ethereum Signed Message:\n" + len(message) + message))`.

With the calculated signature, you can:
- use [`verifyMessage`](/docs/utilities/verifyMessage) to verify the signature,
- use [`recoverMessageAddress`](/docs/utilities/recoverMessageAddress) to recover the signing address from a signature.

## Usage

:::code-group

```ts twoslash [example.ts]
import { account, walletClient } from './config'
 
const signature_1 = await walletClient.signMessage({ // [!code focus:99]
  account,
  message: 'hello world',
})
// @log: Output: "0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b"

const signature_2 = await walletClient.signMessage({
  account,
  // Hex data representation of message.
  message: { raw: '0x68656c6c6f20776f726c64' },
})
// @log: Output: "0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b"
```

```ts twoslash [config.ts] filename="client.ts"
// [!include ~/snippets/walletClient.ts]

export const [account] = await walletClient.getAddresses()
// @log: ↑ JSON-RPC Account

// export const account = privateKeyToAccount(...)
// @log: ↑ Local Account
```

:::

### Account Hoisting

If you do not wish to pass an `account` to every `signMessage`, you can also hoist the Account on the Wallet Client (see `config.ts`).

[Learn more](/docs/clients/wallet#withaccount).

:::code-group

```ts twoslash [example.ts]
import { walletClient } from './config'
 
const signature = await walletClient.signMessage({ // [!code focus:99]
  message: 'hello world',
})
// @log: "0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b"
```

```ts [config.ts (JSON-RPC Account)]
import { createWalletClient, custom } from 'viem'

// Retrieve Account from an EIP-1193 Provider.
const [account] = await window.ethereum.request({ 
  method: 'eth_requestAccounts' 
})

export const walletClient = createWalletClient({
  account,
  transport: custom(window.ethereum!)
})
```

```ts twoslash [config.ts (Local Account)] filename="config.ts"
import { createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

export const walletClient = createWalletClient({
  account: privateKeyToAccount('0x...'),
  transport: http()
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

```ts twoslash
// [!include ~/snippets/walletClient.ts]
// ---cut---
const signature = await walletClient.signMessage({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', // [!code focus:1]
  message: 'hello world',
})
```

### message

- **Type:** `string | { raw: Hex | ByteArray }`

Message to sign.

By default, viem signs the UTF-8 representation of the message.

```ts twoslash
// [!include ~/snippets/walletClient.ts]
// ---cut---
const signature = await walletClient.signMessage({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  message: 'hello world', // [!code focus:1]
})
```

To sign the data representation of the message, you can use the `raw` attribute.

```ts twoslash
// [!include ~/snippets/walletClient.ts]
// ---cut---
const signature = await walletClient.signMessage({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  message: { raw: '0x68656c6c6f20776f726c64' }, // [!code focus:1]
})
```

## JSON-RPC Methods

- JSON-RPC Accounts:
  - [`personal_sign`](https://docs.metamask.io/guide/signing-data#personal-sign)
- Local Accounts
  - Signs locally. No JSON-RPC request.
