---
description: Creates a multi-signature ZKsync Smart Account
---

# toMultisigSmartAccount (ZKsync)

Creates a multi-signature [ZKsync Smart Account](https://docs.zksync.io/build/developer-reference/account-abstraction/building-smart-accounts) from a Contract Address and the Private Key of the owner.

## Usage

```ts twoslash
import { toMultisigSmartAccount } from 'viem/zksync'

const account = toMultisigSmartAccount({
  address: '0xf39Fd6e51aad8F6F4ce6aB8827279cffFb92266', 
  privateKeys: ['0x...', '0x...']
})
```

## Parameters

### address

- **Type:** `Hex`

Address of the deployed Account's Contract implementation.

```ts
const account = toMultisigSmartAccount({
  address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // [!code focus]
  privateKeys: ['0x...', '0x...']
})
```

### privateKeys

- **Type:** `Hex[]`

Private Keys of the owners.

```ts
const account = toMultisigSmartAccount({
  address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 
  privateKeys: ['0x...', '0x...'] // [!code focus]
})
```