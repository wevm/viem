# WebAuthn Account

A WebAuthn Account is nearly identical to a [Local Account](/docs/accounts/local), but with the following differences:

- uses the **secp256r1** curve for signatures
- returns a `signature` as well as `webauthn` data in its signing methods
- cannot sign transactions (transactions do not support **secp256r1** signatures)
- does not have an Ethereum `address`

WebAuthn Accounts are commonly used for **[Smart Account](/account-abstraction/accounts/smart) Owners** (such as [Coinbase Smart Wallet](/account-abstraction/accounts/smart/toCoinbaseSmartAccount#owners)) to sign User Operations and messages on behalf of the Smart Account.

## Usage

```ts twoslash
import { createWebAuthnCredential, toWebAuthnAccount } from 'viem/account-abstraction'

// Register a credential (ie. passkey).
const credential = await createWebAuthnCredential({
  name: 'Example',
})

// Create a WebAuthn account from the credential.
const account = toWebAuthnAccount({
  credential,
})
```