---
head:
  - - meta
    - property: og:title
      content: recoverMessageAddress
  - - meta
    - name: description
      content: Recovers the signing address from a message & signature.
  - - meta
    - property: og:description
      content: Recovers the signing address from a message & signature.

---

# recoverMessageAddress

Recovers the original signing address from a message & signature.

Useful for obtaining the address of a message that was signed with [`signMessage`](/docs/actions/wallet/signMessage).

## Usage

::: code-group

```ts [example.ts]
import { getAccount } from 'viem'
import { account, walletClient } from './client'
 
const signature = await walletClient.signMessage({
  account,
  message: 'hello world',
})

const address = recoverMessageAddress({ // [!code focus:99]
  message: 'hello world',
  signature,
})
```

```ts [client.ts]
import { createWalletClient, custom, getAccount } from 'viem'

export const account = getAccount('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266')

export const walletClient = createWalletClient({
  transport: custom(window.ethereum)
})
```

:::

## Returns

[`Address`](/docs/glossary/types#address)

The signing address.

## Parameters

### message

- **Type:** `string`

The message that was signed.

```ts
const address = recoverMessageAddress({ 
  message: 'hello world', // [!code focus]
  signature: '0x66edc32e2ab001213321ab7d959a2207fcef5190cc9abb6da5b0d2a8a9af2d4d2b0700e2c317c4106f337fd934fbbb0bf62efc8811a78603b33a8265d3b8f8cb1c'
})
```

### signature

- **Type:** `Hex | ByteArray`

The signature of the message.

```ts
const address = recoverMessageAddress({ 
  message: 'hello world',
  signature: '0x66edc32e2ab001213321ab7d959a2207fcef5190cc9abb6da5b0d2a8a9af2d4d2b0700e2c317c4106f337fd934fbbb0bf62efc8811a78603b33a8265d3b8f8cb1c' // [!code focus]
})
```