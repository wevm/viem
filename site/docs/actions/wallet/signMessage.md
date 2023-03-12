---
head:
  - - meta
    - property: og:title
      content: signMessage
  - - meta
    - name: description
      content: Calculates an Ethereum-specific signature.
  - - meta
    - property: og:description
      content: Calculates an Ethereum-specific signature.

---

# signMessage

Calculates an Ethereum-specific signature in the form of `keccak256("\x19Ethereum Signed Message:\n" + len(message) + message))`.

Takes a byte array or hex value as the `data` argument.

## Usage

::: code-group

```ts [example.ts]
import { getAccount } from 'viem'
import { walletClient } from './client'
 
const account = getAccount('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266')
 
const signature = await walletClient.signMessage({ // [!code focus:99]
  account,
  data: '0xdeadbeaf',
})
// "0xa3f20717a250c2b0b729b7e5becbff67fdaef7e0699da4de7ca5895b02a170a12d887fd3b17bfdce3481f10bea41f45ba9f709d39ce8325427b57afcfc994cee1b"
```

```ts [client.ts]
import { createWalletClient, custom } from 'viem'

export const walletClient = createWalletClient({
  transport: custom(window.ethereum)
})
```

:::

## Returns

[`Hex`](/docs/glossary/types#hex)

The signed message.

## Parameters

### account

- **Type:** [`Address`](/docs/glossary/types#address)

Account to use for signing. [Read more](/docs/clients/wallet).

```ts
const signature = await walletClient.signMessage({
  account: getAccount('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'), // [!code focus:1]
  data: '0xdeadbeaf',
})
```

### data

- **Type:** `string`

Message to sign.

```ts
const signature = await walletClient.signMessage({
  account: getAccount('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'),
  data: 'hello world', // [!code focus:1]
})
```

## JSON-RPC Methods

- JSON-RPC Accounts:
  - [`personal_sign`](https://docs.metamask.io/guide/signing-data.html#personal-sign)
- Local Accounts
  - Signs locally. No JSON-RPC request.