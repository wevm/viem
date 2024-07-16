# Coinbase

The `coinbase` Implementation references the [Coinbase Smart Wallet](https://github.com/coinbase/smart-wallet) contract implementation. 

## Usage

:::code-group

```ts twoslash [example.ts]
import { toSmartAccount, coinbase } from 'viem/account-abstraction' // [!code focus]
import { client } from './client.js'
import { owner } from './owner.js'

const account = await toSmartAccount({
  client,
  implementation: coinbase({ // [!code focus]
    owners: [owner], // [!code focus]
  }), // [!code focus]
})
```

```ts twoslash [client.ts] filename="config.ts"
import { http, createPublicClient } from 'viem'
import { mainnet } from 'viem/chains'
 
export const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})
```

```ts twoslash [owner.ts (Private Key)] filename="owner.ts"
import { privateKeyToAccount } from 'viem/accounts'
 
export const owner = privateKeyToAccount('0x...')
```

```ts twoslash [owner.ts (Passkey)] filename="owner.ts"
import { createWebAuthnCredential, toWebAuthnAccount } from 'viem/account-abstraction'

const credential = await createWebAuthnCredential({ name: 'Wallet' })
 
export const owner = toWebAuthnAccount({ credential })
```

:::

## Returns

`SmartAccountImplementationFn<SoladyImplementation>`

## Parameters

### owners

- **Type:** `(LocalAccount | WebAuthnAccount)[]`

Owners of the Smart Account. Can be a [Local Account](/docs/accounts/local) or a [WebAuthn Account (Passkey)](/account-abstraction/accounts/webauthn).

```ts twoslash
const account = await toSmartAccount({
  client,
  implementation: coinbase({
    owners: [privateKeyToAccount('0x...')], // [!code focus]
  }),
})
```

### nonce

- **Type:** `bigint`

Nonce to use for the Smart Account.

```ts
const account = await toSmartAccount({
  client,
  implementation: coinbase({
    owners: [owner],
    nonce: 1n, // [!code focus]
  }),
})
```
