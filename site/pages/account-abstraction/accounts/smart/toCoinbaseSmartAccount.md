# Coinbase

The `toCoinbaseSmartAccount` implementation references the [Coinbase Smart Wallet](https://github.com/coinbase/smart-wallet) contract. 

## Usage

:::code-group

```ts twoslash [example.ts]
import { toCoinbaseSmartAccount } from 'viem/account-abstraction' // [!code focus]
import { client } from './client.js'
import { owner } from './owner.js'

const account = await toCoinbaseSmartAccount({ // [!code focus]
  client, // [!code focus]
  owners: [owner], // [!code focus]
}) // [!code focus]
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

// Register a credential (ie. passkey).
const credential = await createWebAuthnCredential({ name: 'Wallet' })
 
// Create a WebAuthn owner account from the credential.
export const owner = toWebAuthnAccount({ credential })
```

:::

## Returns

`SmartAccount`

## Parameters

### client

- **Type:** `Client`

Client used to retrieve Smart Account data.

```ts
const client = createPublicClient({ // [!code focus]
  chain: mainnet, // [!code focus]
  transport: http(), // [!code focus]
}) // [!code focus]

const account = await toCoinbaseSmartAccount({
  client, // [!code focus]
  owners: [owner],
})
```

### owners

- **Type:** `(LocalAccount | WebAuthnAccount)[]`

Owners of the Smart Account. Can be a [Local Account](/docs/accounts/local) or a [WebAuthn Account (Passkey)](/account-abstraction/accounts/webauthn).

```ts
const account = await toCoinbaseSmartAccount({
  client,
  owners: [privateKeyToAccount('0x...')], // [!code focus]
})
```

### nonce (optional)

- **Type:** `bigint`

Nonce to use for the Smart Account.

```ts
const account = await toCoinbaseSmartAccount({
  client,
  owners: [owner],
  nonce: 1n, // [!code focus]
})
```
