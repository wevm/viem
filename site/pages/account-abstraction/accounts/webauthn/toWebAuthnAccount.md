# toWebAuthnAccount

Creates a **WebAuthn Account** – commonly used for **[Smart Account](/account-abstraction/accounts/smart) Owners** (such as [Coinbase Smart Wallet](/account-abstraction/accounts/smart/coinbase#owners)) to sign User Operations and messages on behalf of the Smart Account.

## Import

```ts twoslash
import { toWebAuthnAccount } from 'viem/account-abstraction'
```

## Usage

```ts twoslash
import { createWebAuthnCredential, toWebAuthnAccount } from 'viem/account-abstraction'

// Register a credential (ie. passkey).
const credential = await createWebAuthnCredential({
  name: 'Example',
})

// Create a WebAuthn account from the credential. // [!code focus]
const account = toWebAuthnAccount({ // [!code focus]
  credential, // [!code focus]
}) // [!code focus]
```

## Returns

`WebAuthnAccount`

A WebAuthn Account.

## Parameters

### credential

- **Type:** `P256Credential`

A P256 WebAuthn Credential.

```ts twoslash
import { createWebAuthnCredential, toWebAuthnAccount } from 'viem/account-abstraction'
// ---cut---
const credential = await createWebAuthnCredential({
  name: 'Example',
})

const account = toWebAuthnAccount({
  credential, // [!code focus]
})
```

### getFn

- **Type:** `(options: CredentialRequestOptions) => Promise<Credential | null>`
- **Default:** `window.navigator.credentials.get`

Credential request function. Useful for environments that do not support the WebAuthn API natively (i.e. React Native or testing environments).

```ts twoslash
// @noErrors
import { createWebAuthnCredential, toWebAuthnAccount } from 'viem/account-abstraction'
// ---cut---
import * as passkey from 'react-native-passkeys' // [!code focus]

const credential = await createWebAuthnCredential({
  name: 'Example',
})

const account = toWebAuthnAccount({
  credential,
  getFn: passkey.get, // [!code focus]
})
```

### rpId

- **Type:** `string`
- **Default:** `window.location.hostname`

Relying Party ID.

```ts twoslash
// @noErrors
import { createWebAuthnCredential, toWebAuthnAccount } from 'viem/account-abstraction'
// ---cut---
import * as passkey from 'react-native-passkeys' // [!code focus]

const credential = await createWebAuthnCredential({
  name: 'Example',
})

const account = toWebAuthnAccount({
  credential,
  rpId: 'example.com', // [!code focus]
})
```