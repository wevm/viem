# signMessage (Local Account) [Signs a message with the Account's private key.]

Calculates an Ethereum-specific signature in [EIP-191 format](https://eips.ethereum.org/EIPS/eip-191): `keccak256("\x19Ethereum Signed Message:\n" + len(message) + message))`.

With the calculated signature, you can:

- use [`verifyMessage`](/docs/utilities/verifyMessage) to verify the signature,
- use [`recoverMessageAddress`](/docs/utilities/recoverMessageAddress) to recover the signing address from a signature.

## Usage

```ts twoslash
import { privateKeyToAccount } from 'viem/accounts'

const account = privateKeyToAccount('0x...')

const signature = await account.signMessage({
  // Hex data representation of message.
  message: { raw: '0x68656c6c6f20776f726c64' },
})
// @log: Output: "0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b"
```

## Returns

[`Hex`](/docs/glossary/types#hex)

The signed message.

## Parameters

### message

- **Type:** `string | { raw: Hex | ByteArray }`

Message to sign.

By default, viem signs the UTF-8 representation of the message.

```ts twoslash
import { privateKeyToAccount } from 'viem/accounts'

const account = privateKeyToAccount('0x...')
// ---cut---
const signature = await account.signMessage({
  message: 'hello world', // [!code focus:1]
})
```

To sign the data representation of the message, you can use the `raw` attribute.

```ts twoslash
import { privateKeyToAccount } from 'viem/accounts'

const account = privateKeyToAccount('0x...')
// ---cut---
const signature = await account.signMessage({
  message: { raw: '0x68656c6c6f20776f726c64' }, // [!code focus:1]
})
```
