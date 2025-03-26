---
description: Prepares an EIP-7702 Authorization for signing.
---

# prepareAuthorization

Prepares an [EIP-7702 Authorization](https://eips.ethereum.org/EIPS/eip-7702) for signing. 
This Action will fill the required fields of the Authorization object if they are not provided (e.g. `nonce` and `chainId`).

With the prepared Authorization object, you can use [`signAuthorization`](/docs/eip7702/signAuthorization) to sign over it.

## Usage

:::code-group

```ts twoslash [example.ts]
import { walletClient } from './client'
 
const authorization = await walletClient.prepareAuthorization({ // [!code focus]
  contractAddress: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2', // [!code focus]
}) // [!code focus]
// @log: {
// @log:   chainId: 1,
// @log:   contractAddress: "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
// @log:   nonce: 1,
// @log: }

const signedAuthorization = await walletClient.signAuthorization(authorization)
```

```ts twoslash [client.ts] filename="client.ts"
import { createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'

export const walletClient = createWalletClient({
  account: privateKeyToAccount('0x...'),
  chain: mainnet,
  transport: http(),
})
```

:::

### Explicit Scoping

We can explicitly set a `nonce` and/or `chainId` by supplying them as parameters:

:::code-group

```ts twoslash [example.ts]
import { walletClient } from './client'
 
const authorization = await walletClient.prepareAuthorization({
  contractAddress: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  chainId: 10, // [!code focus]
})
// @log: {
// @log:   chainId: 10,
// @log:   contractAddress: "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
// @log:   nonce: 420,
// @log: }

const signedAuthorization = await walletClient.signAuthorization(authorization)
```

```ts twoslash [client.ts] filename="client.ts"
import { createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'

export const walletClient = createWalletClient({
  account: privateKeyToAccount('0x...'),
  chain: mainnet,
  transport: http(),
})
```

:::

## Returns

`Authorization`

A prepared & unsigned Authorization object.

## Parameters

### account

- **Type:** `Account`

Account to use to prepare the Authorization object. 

Accepts a [Local Account (Private Key, etc)](/docs/clients/wallet#local-accounts-private-key-mnemonic-etc).

```ts twoslash
import { privateKeyToAccount } from 'viem/accounts'
import { walletClient } from './client'

const authorization = await walletClient.prepareAuthorization({
  account: privateKeyToAccount('0x...'), // [!code focus]
  contractAddress: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2'
}) 
```

### chainId (optional)

- **Type:** `Address`
- **Default:** `client.chain.id` or Network chain ID

The Chain ID to scope the Authorization to. If set to zero (`0`), then the Authorization will
be valid on all chains.

```ts twoslash
import { privateKeyToAccount } from 'viem/accounts'
import { walletClient } from './client'

const authorization = await walletClient.prepareAuthorization({
  account: privateKeyToAccount('0x...'),
  contractAddress: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  chainId: 1, // [!code focus]
}) 
```

### contractAddress

- **Type:** `Address`

The target Contract to designate onto the Account.

```ts twoslash
import { privateKeyToAccount } from 'viem/accounts'
import { walletClient } from './client'

const authorization = await walletClient.prepareAuthorization({
  account: privateKeyToAccount('0x...'),
  contractAddress: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2' // [!code focus]
}) 
```

### executor (optional)

- **Type:** `'self' | undefined`

Whether the EIP-7702 Transaction will be executed by the Account that signed the Authorization.

If not specified, it will be assumed that the EIP-7702 Transaction will be executed by another Account (ie. a relayer Account).

```ts twoslash
import { privateKeyToAccount } from 'viem/accounts'
import { walletClient } from './client'

const authorization = await walletClient.prepareAuthorization({
  account: privateKeyToAccount('0x...'),
  contractAddress: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  executor: 'self', // [!code focus]
}) 
```

### nonce (optional)

- **Type:** `Address`
- **Default:** Account's next available nonce.

The nonce to scope the Authorization to.

```ts twoslash
import { privateKeyToAccount } from 'viem/accounts'
import { walletClient } from './client'

const authorization = await walletClient.prepareAuthorization({
  account: privateKeyToAccount('0x...'),
  contractAddress: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  nonce: 69, // [!code focus]
}) 
```