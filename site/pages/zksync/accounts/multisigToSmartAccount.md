---
description: Creates a `SmartAccount` instance that uses multiple ECDSA keys for signing payloads
---

# multisigToSmartAccount

Creates a `SmartAccount` instance that uses multiple ECDSA keys for signing payloads.

## Usage

```ts twoslash
import { createWalletClient, http } from 'viem'
import { multisigToSmartAccount } from 'viem/zksync'
import { mainnet } from 'viem/chains'

const account = multisigToSmartAccount({
  address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 
  secrets: ['0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', '0xac1e735be8536c6534bb4f17f06f6afc73b2b5ba84ac2cfb12f7461b20c0bbe3']
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

Returns an account object equipped with a custom `signPayload` function tailored for signing with multiple ECDSA keys.

## Parameters

### address

- **Type:** `Hex`

The address of the deployed multisig contract.

```ts
const account = multisigToSmartAccount({
  address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // [!code focus]
  secrets: ['0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', '0xac1e735be8536c6534bb4f17f06f6afc73b2b5ba84ac2cfb12f7461b20c0bbe3']
})
```

### secrets

- **Type:** `Hex[]`

The array of ECDSA keys employed for signing.

```ts
const account = multisigToSmartAccount({
  address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 
  secrets: ['0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', '0xac1e735be8536c6534bb4f17f06f6afc73b2b5ba84ac2cfb12f7461b20c0bbe3'] // [!code focus]
})
```


