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
  contractAddress: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2', // [!code focus]
}) // [!code focus]
// @log: {
// @log:   chainId: 1,
// @log:   contractAddress: "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
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

### chainId (optional)

- **Type:** `Address`
- **Default:** `client.chain.id` or Network chain ID

The Chain ID to scope the Authorization to.

```ts twoslash
import { privateKeyToAccount } from 'viem/accounts'
import { walletClient } from './client'

const authorization = await walletClient.signAuthorization({
  account: privateKeyToAccount('0x...'),
  contractAddress: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  chainId: 1, // [!code focus]
}) 
```

### contractAddress

- **Type:** `Address`

The target Contract to inject onto the Account.

```ts twoslash
import { privateKeyToAccount } from 'viem/accounts'
import { walletClient } from './client'

const authorization = await walletClient.signAuthorization({
  account: privateKeyToAccount('0x...'),
  contractAddress: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2' // [!code focus]
}) 
```

### nonce (optional)

- **Type:** `Address`
- **Default:** Account's next available nonce.

The nonce to scope the Authorization to.

```ts twoslash
import { privateKeyToAccount } from 'viem/accounts'
import { walletClient } from './client'

const authorization = await walletClient.signAuthorization({
  account: privateKeyToAccount('0x...'),
  contractAddress: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  nonce: 69, // [!code focus]
}) 
```