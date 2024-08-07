---
description: Signs typed data via Solady's ERC-1271 format.
---

# signTypedData

Signs [EIP-712](https://eips.ethereum.org/EIPS/eip-712) typed data via [ERC-7739 `TypedDataSign` format](https://eips.ethereum.org/EIPS/eip-7739).

This Action is suitable to sign messages for contracts (e.g. ERC-4337 Smart Accounts) that implement (or conform to) [ERC-7739](https://eips.ethereum.org/EIPS/eip-7739) (e.g. Solady's [ERC1271.sol](https://github.com/Vectorized/solady/blob/main/src/accounts/ERC1271.sol)).

With the calculated signature, you can use [`verifyTypedData`](/docs/actions/public/verifyTypedData) to verify the signature

## Usage

:::code-group

```ts twoslash [example.ts]
import { account, walletClient } from './config'
import { domain, types } from './data'
 
const signature = await walletClient.signTypedData({ // [!code focus:99]
  // Account used for signing.
  account,
  domain,
  types,
  primaryType: 'Mail',
  message: {
    from: {
      name: 'Cow',
      wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
    },
    to: {
      name: 'Bob',
      wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
    },
    contents: 'Hello, Bob!',
  },
  // Verifying contract address (e.g. ERC-4337 Smart Account).
  verifier: '0xCB9fA1eA9b8A3bf422a8639f23Df77ea66020eC2'
})
```

```ts twoslash [data.ts]
// All properties on a domain are optional
export const domain = {
  name: 'Ether Mail',
  version: '1',
  chainId: 1,
  verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
} as const
 
// The named list of all type definitions
export const types = {
  Person: [
    { name: 'name', type: 'string' },
    { name: 'wallet', type: 'address' },
  ],
  Mail: [
    { name: 'from', type: 'Person' },
    { name: 'to', type: 'Person' },
    { name: 'contents', type: 'string' },
  ],
} as const
```

```ts twoslash [config.ts] filename="config.ts"
import { createWalletClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { erc7739 } from 'viem/experimental'

export const walletClient = createWalletClient({
  chain: mainnet,
  transport: http(),
}).extend(erc7739())

export const [account] = await walletClient.getAddresses()
// @log: ↑ JSON-RPC Account

// export const account = privateKeyToAccount(...)
// @log: ↑ Local Account
```

:::

## Account and/or Verifier Hoisting

If you do not wish to pass an `account` and/or `verifier` to every `signTypedData`, you can also hoist the Account and/or Verifier on the Wallet Client (see `config.ts`).

[Learn more](/docs/clients/wallet#withaccount).

:::code-group

```ts twoslash [example.ts]
import { walletClient } from './config'
import { domain, types } from './data'
 
const signature = await walletClient.signTypedData({ // [!code focus:99]
  domain,
  types,
  primaryType: 'Mail',
  message: {
    from: {
      name: 'Cow',
      wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
    },
    to: {
      name: 'Bob',
      wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
    },
    contents: 'Hello, Bob!',
  },
})
```

```ts twoslash [data.ts]
// All properties on a domain are optional
export const domain = {
  name: 'Ether Mail',
  version: '1',
  chainId: 1,
  verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
} as const
 
// The named list of all type definitions
export const types = {
  Person: [
    { name: 'name', type: 'string' },
    { name: 'wallet', type: 'address' },
  ],
  Mail: [
    { name: 'from', type: 'Person' },
    { name: 'to', type: 'Person' },
    { name: 'contents', type: 'string' },
  ],
} as const
```

```ts [config.ts (JSON-RPC Account)]
import { createWalletClient, custom } from 'viem'
import { erc7739 } from 'viem/experimental'

// Retrieve Account from an EIP-1193 Provider.
const [account] = await window.ethereum.request({ 
  method: 'eth_requestAccounts' 
})

export const walletClient = createWalletClient({
  account,
  transport: custom(window.ethereum!)
}).extend(erc7739({ 
  verifier: '0xCB9fA1eA9b8A3bf422a8639f23Df77ea66020eC2' 
}))
```

```ts twoslash [config.ts (Local Account)] filename="config.ts"
import { createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { erc7739 } from 'viem/experimental'

export const walletClient = createWalletClient({
  account: privateKeyToAccount('0x...'),
  transport: http()
}).extend(erc7739({ 
  verifier: '0xCB9fA1eA9b8A3bf422a8639f23Df77ea66020eC2' 
}))
```

:::

## Returns

[`Hex`](/docs/glossary/types#hex)

The signed data.

## Parameters

### account

- **Type:** `Account | Address`

Account to used to sign the typed data.

Accepts a [JSON-RPC Account](/docs/clients/wallet#json-rpc-accounts) or [Local Account (Private Key, etc)](/docs/clients/wallet#local-accounts-private-key-mnemonic-etc).

```ts twoslash
import { walletClient } from './config'

const signature = await walletClient.signTypedData({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', // [!code focus:1]
  domain: {
    name: 'Ether Mail',
    version: '1',
    chainId: 1,
    verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
  },
  types: {
    Person: [
      { name: 'name', type: 'string' },
      { name: 'wallet', type: 'address' },
    ],
    Mail: [
      { name: 'from', type: 'Person' },
      { name: 'to', type: 'Person' },
      { name: 'contents', type: 'string' },
    ],
  },
  primaryType: 'Mail',
  message: {
    from: {
      name: 'Cow',
      wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
    },
    to: {
      name: 'Bob',
      wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
    },
    contents: 'Hello, Bob!',
  },
  verifier: '0xCB9fA1eA9b8A3bf422a8639f23Df77ea66020eC2'
})
```

### domain

**Type:** `TypedDataDomain`

The typed data domain.

```ts twoslash
import { walletClient } from './config'

const signature = await walletClient.signTypedData({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  domain: { // [!code focus:6]
    name: 'Ether Mail',
    version: '1',
    chainId: 1,
    verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
  },
  types: {
    Person: [
      { name: 'name', type: 'string' },
      { name: 'wallet', type: 'address' },
    ],
    Mail: [
      { name: 'from', type: 'Person' },
      { name: 'to', type: 'Person' },
      { name: 'contents', type: 'string' },
    ],
  },
  primaryType: 'Mail',
  message: {
    from: {
      name: 'Cow',
      wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
    },
    to: {
      name: 'Bob',
      wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
    },
    contents: 'Hello, Bob!',
  },
  verifier: '0xCB9fA1eA9b8A3bf422a8639f23Df77ea66020eC2'
})
```

### types

The type definitions for the typed data.

```ts twoslash
import { walletClient } from './config'

const signature = await walletClient.signTypedData({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  domain: { 
    name: 'Ether Mail',
    version: '1',
    chainId: 1,
    verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
  },
  types: { // [!code focus:11]
    Person: [
      { name: 'name', type: 'string' },
      { name: 'wallet', type: 'address' },
    ],
    Mail: [
      { name: 'from', type: 'Person' },
      { name: 'to', type: 'Person' },
      { name: 'contents', type: 'string' },
    ],
  },
  primaryType: 'Mail',
  message: {
    from: {
      name: 'Cow',
      wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
    },
    to: {
      name: 'Bob',
      wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
    },
    contents: 'Hello, Bob!',
  },
})
```

### primaryType

**Type:** Inferred `string`.

The primary type to extract from `types` and use in `value`.

```ts twoslash
import { walletClient } from './config'

const signature = await walletClient.signTypedData({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  domain: { 
    name: 'Ether Mail',
    version: '1',
    chainId: 1,
    verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
  },
  types: {
    Person: [
      { name: 'name', type: 'string' },
      { name: 'wallet', type: 'address' },
    ],
    Mail: [ // [!code focus:5]
      { name: 'from', type: 'Person' },
      { name: 'to', type: 'Person' },
      { name: 'contents', type: 'string' },
    ],
  },
  primaryType: 'Mail', // [!code focus]
  message: {
    from: {
      name: 'Cow',
      wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
    },
    to: {
      name: 'Bob',
      wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
    },
    contents: 'Hello, Bob!',
  },
})
```

### message

**Type:** Inferred from `types` & `primaryType`.

```ts twoslash
import { walletClient } from './config'

const signature = await walletClient.signTypedData({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  domain: { 
    name: 'Ether Mail',
    version: '1',
    chainId: 1,
    verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
  },
  types: {
    Person: [
      { name: 'name', type: 'string' },
      { name: 'wallet', type: 'address' },
    ],
    Mail: [
      { name: 'from', type: 'Person' },
      { name: 'to', type: 'Person' },
      { name: 'contents', type: 'string' },
    ],
  },
  primaryType: 'Mail', 
  message: { // [!code focus:11]
    from: {
      name: 'Cow',
      wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
    },
    to: {
      name: 'Bob',
      wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
    },
    contents: 'Hello, Bob!',
  },
  verifier: '0xCB9fA1eA9b8A3bf422a8639f23Df77ea66020eC2'
})
```

### verifier

- **Type:** `Address`

The address of the verifying contract (e.g. a ERC-4337 Smart Account). Required if `verifierDomain` is not passed.

```ts twoslash
import { walletClient } from './config'

const signature = await walletClient.signTypedData({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  domain: { 
    name: 'Ether Mail',
    version: '1',
    chainId: 1,
    verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
  },
  types: {
    Person: [
      { name: 'name', type: 'string' },
      { name: 'wallet', type: 'address' },
    ],
    Mail: [
      { name: 'from', type: 'Person' },
      { name: 'to', type: 'Person' },
      { name: 'contents', type: 'string' },
    ],
  },
  primaryType: 'Mail', 
  message: {
    from: {
      name: 'Cow',
      wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
    },
    to: {
      name: 'Bob',
      wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
    },
    contents: 'Hello, Bob!',
  },
  verifier: '0xCB9fA1eA9b8A3bf422a8639f23Df77ea66020eC2' // [!code focus]
})
```

### verifierDomain

- **Type:** `TypedDataDomain`

Account domain separator. Required if `verifier` is not passed.

```ts twoslash
import { walletClient } from './config'

const signature = await walletClient.signTypedData({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  domain: { 
    name: 'Ether Mail',
    version: '1',
    chainId: 1,
    verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
  },
  types: {
    Person: [
      { name: 'name', type: 'string' },
      { name: 'wallet', type: 'address' },
    ],
    Mail: [
      { name: 'from', type: 'Person' },
      { name: 'to', type: 'Person' },
      { name: 'contents', type: 'string' },
    ],
  },
  primaryType: 'Mail', 
  message: {
    from: {
      name: 'Cow',
      wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
    },
    to: {
      name: 'Bob',
      wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
    },
    contents: 'Hello, Bob!',
  },
  verifierDomain: { // [!code focus]
    name: 'SoladyAccount', // [!code focus]
    version: '1', // [!code focus]
    chainId: 1, // [!code focus]
    verifyingContract: '0xCB9fA1eA9b8A3bf422a8639f23Df77ea66020eC2' // [!code focus]
  }, // [!code focus]
})
```
