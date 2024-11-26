---
description: Signs a personal sign message via Solady's ERC-1271 format.
---

# signMessage

Signs an [EIP-191](https://eips.ethereum.org/EIPS/eip-191) personal sign message via [ERC-7739 `PersonalSign` format](https://eips.ethereum.org/EIPS/eip-7739).

This Action is suitable to sign messages for contracts (e.g. ERC-4337 Smart Accounts) that implement (or conform to) [ERC-7739](https://eips.ethereum.org/EIPS/eip-7739) (e.g. Solady's [ERC1271.sol](https://github.com/Vectorized/solady/blob/main/src/accounts/ERC1271.sol)).

With the calculated signature, you can use [`verifyMessage`](/docs/actions/public/verifyMessage) to verify the signature

## Usage

:::code-group

```ts twoslash [example.ts]
import { account, walletClient } from './config'
 
const signature_1 = await walletClient.signMessage({ // [!code focus:99]
  // Account used for signing.
  account,
  message: 'hello world',
  // Verifying contract address (e.g. ERC-4337 Smart Account).
  verifier: '0xCB9fA1eA9b8A3bf422a8639f23Df77ea66020eC2'
})

const signature_2 = await walletClient.signMessage({
  // Account used for signing.
  account,
  // Hex data representation of message.
  message: { raw: '0x68656c6c6f20776f726c64' },
  // Verifying contract address (e.g. ERC-4337 Smart Account)
  verifier: '0xCB9fA1eA9b8A3bf422a8639f23Df77ea66020eC2'
})
```

```ts twoslash [config.ts] filename="config.ts"
import { createWalletClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { erc7739Actions } from 'viem/experimental'

export const walletClient = createWalletClient({
  chain: mainnet,
  transport: http(),
}).extend(erc7739Actions())

export const [account] = await walletClient.getAddresses()
// @log: ↑ JSON-RPC Account

// export const account = privateKeyToAccount(...)
// @log: ↑ Local Account
```

:::

## Account and/or Verifier Hoisting

If you do not wish to pass an `account` and/or `verifier` to every `signMessage`, you can also hoist the Account and/or Verifier on the Wallet Client (see `config.ts`).

[Learn more](/docs/clients/wallet#withaccount).

:::code-group

```ts twoslash [example.ts]
import { walletClient } from './config'
 
const signature = await walletClient.signMessage({ // [!code focus:99]
  message: 'hello world',
})
```

```ts [config.ts (JSON-RPC Account)]
import { createWalletClient, custom } from 'viem'
import { erc7739Actions } from 'viem/experimental'

// Retrieve Account from an EIP-1193 Provider.
const [account] = await window.ethereum.request({ 
  method: 'eth_requestAccounts' 
})

export const walletClient = createWalletClient({
  account,
  transport: custom(window.ethereum!)
}).extend(erc7739Actions({ 
  verifier: '0xCB9fA1eA9b8A3bf422a8639f23Df77ea66020eC2' 
}))
```

```ts twoslash [config.ts (Local Account)] filename="config.ts"
import { createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { erc7739Actions } from 'viem/experimental'

export const walletClient = createWalletClient({
  account: privateKeyToAccount('0x...'),
  transport: http()
}).extend(erc7739Actions({ 
  verifier: '0xCB9fA1eA9b8A3bf422a8639f23Df77ea66020eC2' 
}))
```

:::

## Returns

[`Hex`](/docs/glossary/types#hex)

The signed message.

## Parameters

### account

- **Type:** `Account | Address`

Account to used to sign the message.

Accepts a [JSON-RPC Account](/docs/clients/wallet#json-rpc-accounts) or [Local Account (Private Key, etc)](/docs/clients/wallet#local-accounts-private-key-mnemonic-etc).

```ts twoslash
import { walletClient } from './config'

const signature = await walletClient.signMessage({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', // [!code focus:1]
  message: 'hello world',
  verifier: '0xCB9fA1eA9b8A3bf422a8639f23Df77ea66020eC2'
})
```

### message

- **Type:** `string | { raw: Hex | ByteArray }`

Message to sign.

By default, viem signs the UTF-8 representation of the message.

```ts twoslash
import { walletClient } from './config'

const signature = await walletClient.signMessage({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  message: 'hello world', // [!code focus:1]
  verifier: '0xCB9fA1eA9b8A3bf422a8639f23Df77ea66020eC2',
})
```

To sign the data representation of the message, you can use the `raw` attribute.

```ts twoslash
import { walletClient } from './config'

const signature = await walletClient.signMessage({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  message: { raw: '0x68656c6c6f20776f726c64' }, // [!code focus:1]
  verifier: '0xCB9fA1eA9b8A3bf422a8639f23Df77ea66020eC2',
})
```

### verifier

- **Type:** `Address`

The address of the verifying contract (e.g. a ERC-4337 Smart Account). Required if `verifierDomain` is not passed.

```ts twoslash
import { walletClient } from './config'

const signature = await walletClient.signMessage({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  message: 'hello world',
  verifier: '0xCB9fA1eA9b8A3bf422a8639f23Df77ea66020eC2', // [!code focus:1]
})
```

### verifierDomain

- **Type:** `TypedDataDomain`

Account domain separator. Required if `verifier` is not passed.

```ts twoslash
import { walletClient } from './config'

const signature = await walletClient.signMessage({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  message: 'hello world',
  verifierDomain: { // [!code focus]
    name: 'SoladyAccount', // [!code focus]
    version: '1', // [!code focus]
    chainId: 1, // [!code focus]
    verifyingContract: '0xCB9fA1eA9b8A3bf422a8639f23Df77ea66020eC2' // [!code focus]
  }, // [!code focus]
})
```