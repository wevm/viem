---
description: Creates a single-signature ZKsync Smart Account
---

# toSinglesigSmartAccount (ZKsync)

Creates a single-signature [ZKsync Smart Account](https://docs.zksync.io/build/developer-reference/account-abstraction/building-smart-accounts) from a Contract Address and the Private Key of the owner.

## Usage

```ts twoslash
import { toSinglesigSmartAccount } from 'viem/zksync'

const account = toSinglesigSmartAccount({
  address: '0xf39Fd6e51aad8F6F4ce6aB8827279cffFb92266', 
  privateKey: '0x...'
})
```

## Parameters

### address

- **Type:** `Hex`

Address of the deployed Account's Contract implementation.

```ts
const account = toSinglesigSmartAccount({
  address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // [!code focus]
  privateKey: '0x...'
})
```

### privateKey

- **Type:** `Hex`

Private Key of the owner.

```ts
const account = toSinglesigSmartAccount({
  address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 
  privateKey: '0x...' // [!code focus]
})
```