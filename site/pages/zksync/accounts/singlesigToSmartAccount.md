---
description: Creates a `SmartAccount` instance that uses singe ECDSA key for signing payloads.
---

# singlesigToSmartAccount

Creates a `SmartAccount` instance that uses singe ECDSA key for signing payloads.

## Usage

```ts twoslash
import { createWalletClient, http } from 'viem'
import { singlesigToSmartAccount } from 'viem/zksync'
import { mainnet } from 'viem/chains'

const account = singlesigToSmartAccount({
  address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 
  secret: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
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

Returns an account object equipped with a custom `signPayload` function tailored for signing with one ECDSA key.

## Parameters

### address

- **Type:** `Hex`

The address of the deployed contract or address of the the account.

```ts
const account = singlesigToSmartAccount({
  address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // [!code focus]
  secret: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
})
```

### secret

- **Type:** `Hex`

The ECDSA key employed for signing. 

```ts
const account = singlesigToSmartAccount({
  address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 
  secret: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80' // [!code focus]
})
```


