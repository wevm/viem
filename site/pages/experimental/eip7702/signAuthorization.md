---
description: Signs an EIP-7702 Authorization object.
---

# signAuthorization

Signs an [EIP-7702 Authorization](https://eips.ethereum.org/EIPS/eip-7702).

<!-- TODO(7702): description -->

## Usage

<!-- TODO(7702): description -->

:::code-group

```ts twoslash [example.ts]
import { walletClient } from './client'
 
const authorization = await walletClient.signAuthorization({ // [!code focus]
  authorization: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2', // [!code focus]
}) // [!code focus]
// @log: {
// @log:   address: "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
// @log:   chainId: 1,
// @log:   nonce: 1,
// @log:   r: "0xf507fb8fa33ffd05a7f26c980bbb8271aa113affc8f192feba87abe26549bda1",
// @log:   s: "0x1b2687608968ecb67230bbf7944199560fa2b3cffe9cc2b1c024e1c8f86a9e08",
// @log:   yParity: 0,
// @log: }

const hash = await walletClient.sendTransaction({
  authorizationList: [authorization],
  data: '0xdeadbeef',
  to: walletClient.account.address,
})
```

```ts twoslash [client.ts] filename="client.ts"
import { createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'
import { eip7702Actions } from 'viem/experimental'

export const walletClient = createWalletClient({
  account: privateKeyToAccount('0x...'),
  chain: mainnet,
  transport: http(),
}).extend(eip7702Actions())
```

:::

### Authorization Object

<!-- TODO(7702): description -->

:::code-group

```ts twoslash [example.ts]
import { walletClient } from './client'
 
const authorization = await walletClient.signAuthorization({ // [!code focus]
  authorization: { // [!code focus]
    address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2', // [!code focus]
    chainId: 1, // [!code focus]
    nonce: 1, // [!code focus]
  }, // [!code focus]
}) // [!code focus]

const hash = await walletClient.sendTransaction({
  authorizationList: [authorization],
  data: '0xdeadbeef',
  to: walletClient.account.address,
})
```

```ts twoslash [client.ts] filename="client.ts"
import { createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'
import { eip7702Actions } from 'viem/experimental'

export const walletClient = createWalletClient({
  account: privateKeyToAccount('0x...'),
  chain: mainnet,
  transport: http(),
}).extend(eip7702Actions())
```

:::

## Returns

`SignedAuthorization`

A signed Authorization object.

## Parameters

### account

- **Type:** `Account`

Account to use to authorize injection of the [Contract (`authorization`)](#authorization) onto the Account.

Accepts a [Local Account (Private Key, etc)](/docs/clients/wallet#local-accounts-private-key-mnemonic-etc).

```ts twoslash
import { privateKeyToAccount } from 'viem/accounts'
import { walletClient } from './client'

const authorization = await walletClient.signAuthorization({
  account: privateKeyToAccount('0x...'), // [!code focus]
  authorization: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2'
}) 
```

### authorization

- **Type:** `Address | Authorization`

The target Contract to inject onto the Account, in the form of an Address string or Authorization object.

#### Contract Address

```ts twoslash
import { privateKeyToAccount } from 'viem/accounts'
import { walletClient } from './client'

const authorization = await walletClient.signAuthorization({
  account: privateKeyToAccount('0x...'),
  authorization: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2' // [!code focus]
}) 
```

#### Object

```ts twoslash
import { privateKeyToAccount } from 'viem/accounts'
import { walletClient } from './client'

const authorization = await walletClient.signAuthorization({
  account: privateKeyToAccount('0x...'),
  authorization: { // [!code focus]
    address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2', // [!code focus]
    chainId: 1, // [!code focus]
    nonce: 1, // [!code focus]
  }, // [!code focus]
}) 
```