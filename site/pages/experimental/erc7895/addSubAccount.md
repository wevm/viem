---
description: Requests to add a Sub Account.
---

# addSubAccount

Requests to add a Sub Account. [See more](https://github.com/ethereum/ERCs/blob/4d3d641ee3c84750baf461b8dd71d27c424417a9/ERCS/erc-7895.md)

[What is a Sub Account?](https://blog.base.dev/subaccounts)

## Usage

:::code-group

```ts twoslash [example.ts]
import { walletClient } from './config'
 
const subAccount = await walletClient.addSubAccount({
  keys: [{ 
    publicKey: '0xefd5fb29a274ea6682673d8b3caa9263e936d48d', 
    type: 'address' 
  }],
  type: 'create',
})
```

```ts twoslash [config.ts] filename="config.ts"
import 'viem/window'
// ---cut---
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'
import { erc7895Actions } from 'viem/experimental'

export const walletClient = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum!),
}).extend(erc7895Actions())
```

:::

## Returns

The created Sub Account.

```ts
type ReturnType = {
  address: Address
  factory?: Address | undefined
  factoryData?: Hex | undefined
}
```

## Parameters

### New Accounts

Allows the wallet to create a Sub Account with a set of known signing keys. [Learn more](https://github.com/ethereum/ERCs/blob/4d3d641ee3c84750baf461b8dd71d27c424417a9/ERCS/erc-7895.md#createaccount)

#### `keys`

Set of signing keys that will belong to the Sub Account.

```ts twoslash
import { walletClient } from './config'
 
const subAccount = await walletClient.addSubAccount({
  keys: [{ // [!code focus]
    publicKey: '0xefd5fb29a274ea6682673d8b3caa9263e936d48d486e5df68893003e01241522', // [!code focus]
    type: 'p256' // [!code focus]
  }], // [!code focus]
  type: 'create',
})
```

#### `keys.publicKey`

- **Type:** `Hex`

The public key of the signing key. 

- This is a 32-byte hexadecimal string.
- For `type: "address"`, this is a 20-byte address.

```ts twoslash
import { walletClient } from './config'
 
const subAccount = await walletClient.addSubAccount({
  keys: [{
    publicKey: '0xefd5fb29a274ea6682673d8b3caa9263e936d48d486e5df68893003e01241522', // [!code focus]
    type: 'p256'
  }],
  type: 'create',
})
```

#### `keys.type`

- **Type:** `'address' | 'p256' | 'webcrypto-p256' | 'webauthn-p256'`

The type of signing key.

```ts twoslash
import { walletClient } from './config'
 
const subAccount = await walletClient.addSubAccount({
  keys: [{
    publicKey: '0xefd5fb29a274ea6682673d8b3caa9263e936d48d486e5df68893003e01241522',
    type: 'p256' // [!code focus]
  }],
  type: 'create',
})
```


### Deployed Accounts

An existing account that the user wants to link to their global account. [Learn more](https://github.com/ethereum/ERCs/blob/4d3d641ee3c84750baf461b8dd71d27c424417a9/ERCS/erc-7895.md#deployedaccount)

#### `address`

Address of the deployed account.

```ts twoslash
import { walletClient } from './config'
 
const subAccount = await walletClient.addSubAccount({
  address: '0x0000000000000000000000000000000000000000', // [!code focus]
  type: 'deployed',
})
```

#### `chainId`

The chain ID of the deployed account.

```ts twoslash
import { walletClient } from './config'
 
const subAccount = await walletClient.addSubAccount({
  address: '0x0000000000000000000000000000000000000000',
  chainId: 1, // [!code focus]
  type: 'deployed',
})
```

### Undeployed Accounts

An account that has been created, but is not yet deployed. The wallet will decide whether or not to deploy it. [Learn more](https://github.com/ethereum/ERCs/blob/4d3d641ee3c84750baf461b8dd71d27c424417a9/ERCS/erc-7895.md#undeployedaccount)

#### `address`

Address of the undeployed account.

```ts twoslash
import { walletClient } from './config'
 
const subAccount = await walletClient.addSubAccount({
  address: '0x0000000000000000000000000000000000000000', // [!code focus]
  factory: '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce', 
  factoryData: '0xdeadbeef',
  type: 'undeployed',
})
```

#### `chainId`

The chain ID the account will be deployed on.

```ts twoslash
import { walletClient } from './config'
 
const subAccount = await walletClient.addSubAccount({
  address: '0x0000000000000000000000000000000000000000',
  chainId: 1, // [!code focus]
  factory: '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce', 
  factoryData: '0xdeadbeef',
  type: 'undeployed',
})
```

#### `factory`

The address of the factory contract.

```ts twoslash
import { walletClient } from './config'
 
const subAccount = await walletClient.addSubAccount({
  address: '0x0000000000000000000000000000000000000000',
  factory: '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce', // [!code focus]
  factoryData: '0xdeadbeef',
  type: 'undeployed',
})
```

#### `factoryData`

The data to be passed to the factory contract.

```ts twoslash
import { walletClient } from './config'
 
const subAccount = await walletClient.addSubAccount({
  address: '0x0000000000000000000000000000000000000000',
  factory: '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce',
  factoryData: '0xdeadbeef', // [!code focus]
  type: 'undeployed',
})
```

