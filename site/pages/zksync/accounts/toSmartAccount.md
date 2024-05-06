---
description: Creates a `SmartAccount` tailored to the provided `signPayload` function and customized logic.
---

# toSmartAccount

Creates a `SmartAccount` tailored to the provided `signPayload` function and customized logic.

## Usage

```ts twoslash
import { createWalletClient, http, type Hex } from 'viem'
import { toSmartAccount } from 'viem/zksync'
import { mainnet } from 'viem/chains'

const account = toSmartAccount({
  address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  signPayload: async (payload: Hex) => {
    // Custom logic for payload signing
      return '0x...'
  },
})

const client = createWalletClient({
  account,
  chain: mainnet,
  transport: http()
})
```

:::warning
When using smart account during the any action that invloves send transaction process for a deployed contract address, gas estimation needs to be provided in the transaction request and cannot be automatically calculated. It must be manually calculated using the real wallet address.
:::

## Returns

`SmartAccount`

Returns an account object equipped with a custom `signPayload` function.

## Parameters

### address

- **Type:** `Hex`

The address of the deployed contract or the wallet's address.

```ts
const account = toSmartAccount({
  address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // [!code focus]
  signPayload: async (payload: Hex) => {
    // Custom logic for payload signing
      return '0x...'
  },
})
```

### signPayload

Function to sign the provided payload with custom logic.

```ts
const account = toSmartAccount({
  address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 
  signPayload: async (payload: Hex) => { // [!code focus]
    // Custom logic for payload signing
      return '0x...'
  }, 
})
```


