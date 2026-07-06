---
description: Recovers the signing address from a message & signature.
---

# recoverMessageAddress

Recovers the original signing address from a message & signature.

Useful for obtaining the address of a message that was signed with [`signMessage`](/docs/actions/wallet/signMessage).

## Usage

:::code-group

```ts [example.ts]
import { recoverMessageAddress } from 'viem';
import { account, walletClient } from './config'
 
const signature = await walletClient.signMessage({
  account,
  message: 'hello world',
})

const address = await recoverMessageAddress({ // [!code focus:99]
  message: 'hello world',
  signature,
})
```

```ts [config.ts]
import { createWalletClient, custom } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

export const walletClient = createWalletClient({
  transport: custom(window.ethereum)
})

// JSON-RPC Account
export const [account] = await walletClient.getAddresses()
// Local Account
export const account = privateKeyToAccount('0x...')
```

:::

## Returns

[`Address`](/docs/glossary/types#address)

The signing address.

## Parameters

### message

- **Type:** `string | { raw: Hex | ByteArray }`

The message that was signed.

By default, viem verifies the UTF-8 representation of the message.

```ts
const address = await recoverMessageAddress({ 
  message: 'hello world', // [!code focus]
  signature: '0x66edc32e2ab001213321ab7d959a2207fcef5190cc9abb6da5b0d2a8a9af2d4d2b0700e2c317c4106f337fd934fbbb0bf62efc8811a78603b33a8265d3b8f8cb1c'
})
```

To verify the data representation of the message, you can use the `raw` attribute.

```ts
const address = await recoverMessageAddress({ 
  message: { raw: '0x68656c6c6f20776f726c64' }, // [!code focus:1]
  signature: '0x66edc32e2ab001213321ab7d959a2207fcef5190cc9abb6da5b0d2a8a9af2d4d2b0700e2c317c4106f337fd934fbbb0bf62efc8811a78603b33a8265d3b8f8cb1c'
})
```

### signature

- **Type:** `Hex | ByteArray | Signature`

The signature of the message.

```ts
const address = await recoverMessageAddress({ 
  message: 'hello world',
  signature: '0x66edc32e2ab001213321ab7d959a2207fcef5190cc9abb6da5b0d2a8a9af2d4d2b0700e2c317c4106f337fd934fbbb0bf62efc8811a78603b33a8265d3b8f8cb1c' // [!code focus]
})
```
