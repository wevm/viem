---
description: Creates a ZKsync Smart Account
---

# toSmartAccount (ZKsync)

Creates a [ZKsync Smart Account](https://docs.zksync.io/build/developer-reference/account-abstraction/building-smart-accounts) from a Contract Address and an array of owner(s).

## Usage

```ts twoslash
import { privateKeyToAccount } from 'viem/accounts'
import { toSmartAccount } from 'viem/zksync'

const account = toSmartAccount({
  address: '0xf39Fd6e51aad8F6F4ce6aB8827279cffFb92266', 
  owners: [
    privateKeyToAccount('0x...'), 
    privateKeyToAccount('0x...')
  ]
})
```

## Parameters

### address

- **Type:** `Hex`

Address of the deployed Account's Contract implementation.

```ts
const account = toSmartAccount({
  address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // [!code focus]
  owners: [
    privateKeyToAccount('0x...'), 
    privateKeyToAccount('0x...')
  ]
})
```

### privateKeys

- **Type:** `LocalAccount[]`

Owners of the Smart Account. Must be a set of [Local Accounts](/docs/accounts/local) (Private Key, Mnemonic, etc).

```ts
const account = toSmartAccount({
  address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 
  owners: [ // [!code focus]
    privateKeyToAccount('0x...'), // [!code focus]
    privateKeyToAccount('0x...') // [!code focus]
  ] // [!code focus]
})
```