# WebAuthn Account

A WebAuthn Account is nearly identical to a [Local Account](/docs/accounts/local), but with the following differences:

- uses the **secp256r1** curve for signatures
- returns a `signature` as well as `webauthn` data in its signing methods
- cannot sign transactions (transactions do not support **secp256r1** signatures)
- does not have an Ethereum `address`

WebAuthn Accounts are commonly used for **[Smart Account](/account-abstraction/accounts/smart) Owners** to sign User Operations and messages on behalf of the Smart Account.

WebAuthn Account owners are currently supported on the following Smart Account implementations:

- [`toCoinbaseSmartAccount`](/account-abstraction/accounts/smart/toCoinbaseSmartAccount#owners)

## Usage

:::code-group

```ts twoslash [example.ts]
import { 
  createWebAuthnCredential, 
  toWebAuthnAccount,
  toCoinbaseSmartAccount 
} from 'viem/account-abstraction'
import { client } from './client'

// 1. Register a credential (ie. passkey).
const credential = await createWebAuthnCredential({
  name: 'Example',
})

// 2. Create a WebAuthn owner account from the credential.
const owner = toWebAuthnAccount({
  credential,
})

// 3. Hook up the owner to a WebAuthn-compatible Smart Account.
const account = toCoinbaseSmartAccount({
  client,
  owners: [owner],
})
```

```ts twoslash [client.ts] filename="client.ts"
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

export const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})
```

:::