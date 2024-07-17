# Solady

The `toSoladySmartAccount` simple Smart Account Implementation that references [Solady's `ERC4337.sol`](https://github.com/Vectorized/solady/blob/main/src/accounts/ERC4337.sol) Smart Account contract.

:::warning
This implementation is unaudited. It is intended to be used for testing purposes or as a reference to implement a [Custom Account](/account-abstraction/accounts/smart/toSmartAccount).
:::

## Usage

:::code-group

```ts twoslash [example.ts]
import { toSoladySmartAccount } from 'viem/account-abstraction' // [!code focus]
import { client, owner } from './config.js'

const account = await toSoladySmartAccount({ // [!code focus]
  client, // [!code focus]
  factoryAddress: '0xda4b37208c41c4f6d1b101cac61e182fe1da0754', // [!code focus]
  owner, // [!code focus]
}) // [!code focus]
```

```ts twoslash [config.ts] filename="config.ts"
import { http, createPublicClient } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'

export const owner = privateKeyToAccount('0x...')
 
export const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})
```

:::

## Returns

`SmartAccountImplementationFn<SoladyImplementation>`

## Parameters

### entryPoint

- **Type:** `{ abi: Abi, address: Address, version: EntryPointVersion }`

Compatible EntryPoint for the Smart Account to reference. The EntryPoint is used
to:

- Determine the target EntryPoint address for the User Operation
- Compute User Operation hashes
- Retrieve the Smart Account nonce
- Distinguish which type of `UserOperation` structure to use

```ts
const account = await toSoladySmartAccount({
  client,
  entryPoint: { // [!code focus]
    abi: [/* ... */], // [!code focus]
    address: '0x0000000071727De22E5E9d8BAf0edAc6f37da032', // [!code focus]
    version: '0.7', // [!code focus]
  }, // [!code focus]
  factoryAddress: '0xda4b37208c41c4f6d1b101cac61e182fe1da0754',
  owner,
})
```

### factoryAddress

- **Type:** `Address`

Factory address of the Smart Account.

```ts
const account = await toSoladySmartAccount({
  client,
  factoryAddress: '0xda4b37208c41c4f6d1b101cac61e182fe1da0754', // [!code focus]
  owner,
})
```

### owner

- **Type:** `Address | Account`

Owner of the Smart Account.

```ts
const account = await toSoladySmartAccount({
  client,
  factoryAddress: '0xda4b37208c41c4f6d1b101cac61e182fe1da0754',
  owner: privateKeyToAccount('0x...'), // [!code focus]
})
```

### salt

- **Type:** `Hex`

Salt to use for Smart Account deployment.

```ts
const account = await toSoladySmartAccount({
  client,
  factoryAddress: '0xda4b37208c41c4f6d1b101cac61e182fe1da0754',
  owner,
  salt: '0x5', // [!code focus]
})
```
