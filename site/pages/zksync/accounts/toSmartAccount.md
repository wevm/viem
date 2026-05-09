---
description: Creates a ZKsync Smart Account
---

# toSmartAccount (ZKsync)

Creates a [ZKsync Smart Account](https://docs.zksync.io/build/developer-reference/account-abstraction/building-smart-accounts) from a Contract Address and a custom sign function.

## Usage

```ts twoslash
import { toSmartAccount } from 'viem/zksync'

const account = toSmartAccount({
  address: '0xf39Fd6e51aad8F6F4ce6aB8827279cffFb92266', 
  async sign({ hash }) {
    // ... signing logic
    return '0x...'
  }
})
```

## Parameters

### address

- **Type:** `Hex`

Address of the deployed Account's Contract implementation.

```ts
const account = toSmartAccount({
  address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // [!code focus]
  async sign({ hash }) {
    // ...
  }
})
```

### sign

- **Type:** `({ hash: Hex }) => Hex`

Custom sign function for the Smart Account.

```ts
const account = toSmartAccount({
  address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 
  async sign({ hash }) { // [!code focus]
    // ... // [!code focus]
  } // [!code focus]
})
```