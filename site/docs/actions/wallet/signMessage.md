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

Calculates an Ethereum-specific signature in [EIP-191 format](https://eips.ethereum.org/EIPS/eip-191): `keccak256("\x19Ethereum Signed Message:\n" + len(message) + message))`.

With the calculated signature, you can:
- use [`verifyMessage`](/docs/utilities/verifyMessage) to verify the signature,
- use [`recoverMessageAddress`](/docs/utilities/recoverMessageAddress) to recover the signing address from a signature.

## Usage

::: code-group

```ts [example.ts]
import { getAccount } from 'viem'
import { walletClient } from './client'
 
const account = getAccount('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266')
 
const signature = await walletClient.signMessage({ // [!code focus:99]
  account,
  message: 'hello world',
})
// "0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b"
```

```ts [client.ts]
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'

export const walletClient = createWalletClient({
  chain: mainnet,
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
  message: 'hello world',
})
```

### data

- **Type:** `string`

Message to sign.

```ts
const signature = await walletClient.signMessage({
  account: getAccount('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'),
  message: 'hello world', // [!code focus:1]
})
```

## JSON-RPC Methods

- JSON-RPC Accounts:
  - [`personal_sign`](https://docs.metamask.io/guide/signing-data.html#personal-sign)
- Local Accounts
  - Signs locally. No JSON-RPC request.