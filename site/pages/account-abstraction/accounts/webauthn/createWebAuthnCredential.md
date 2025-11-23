# createWebAuthnCredential

Registers a **WebAuthn Credential** designed to be used to create a [WebAuthn Account](/account-abstraction/accounts/webauthn/toWebAuthnAccount).

:::note
This function uses [`ox/WebAuthnP256`](https://github.com/wevm/ox) under-the-hood.
:::

## Overview

`createWebAuthnCredential` initiates the WebAuthn (passkey) registration flow on the user's device, creating a cryptographic P256 credential that can later be used for authentication. 

This function uses `navigator.credentials.create()` internally. [Read more](https://developer.mozilla.org/en-US/docs/Web/API/CredentialsContainer/create).

## Import

```ts twoslash
import { createWebAuthnCredential } from 'viem/account-abstraction'
```

## Usage

At minimum, you need to provide a name to identify the credential:

```ts twoslash
import { 
  createWebAuthnCredential, 
  toWebAuthnAccount 
} from 'viem/account-abstraction'

// Register a credential (ie. passkey).
const credential = await createWebAuthnCredential({
  name: 'Example',
})

// Create a WebAuthn account from the credential.
const account = toWebAuthnAccount({
  credential,
})
```

The function returns a `P256Credential` object that you can then pass to `toWebAuthnAccount()` to create an account, or store in your database for later use.

## Returns

`P256Credential`

A P-256 WebAuthn Credential object with the following structure:

```ts
{
  id: string                    // The credential ID
  publicKey: Hex                // Hex-encoded public key (includes 0x prefix)
  raw: PublicKeyCredential      // Raw credential from the Web Authentication API
}
```

This credential object is designed to be passed to `toWebAuthnAccount()` to create a `WebAuthnAccount`, which provides signing capabilities for transactions and messages.

## Parameters

### name 

- **Type:** `string`

A user-friendly display name for the credential. This appears in your browser's credential manager and helps users identify which passkey they're using. Use something descriptive like "My Laptop Fingerprint" or "Security Key".

```ts twoslash
import { createWebAuthnCredential, toWebAuthnAccount } from 'viem/account-abstraction'
// ---cut---
const credential = await createWebAuthnCredential({
  name: 'Example',
})
```

### challenge (optional)

- **Type:** `Uint8Array`

A random cryptographic value that proves the credential creation request. If you don't provide one, the function generates a random one.

```ts twoslash
import { createWebAuthnCredential, toWebAuthnAccount } from 'viem/account-abstraction'
// ---cut---
const credential = await createWebAuthnCredential({
  challenge: new Uint8Array([1, 2, 3]),
  name: 'Example',
})
```

### rp (optional)

- **Type:** `{ id: string; name: string }`

An object describing the relying party. [Read more](https://developer.mozilla.org/en-US/docs/Web/API/PublicKeyCredentialCreationOptions#rp).

```ts twoslash
import { createWebAuthnCredential, toWebAuthnAccount } from 'viem/account-abstraction'
// ---cut---
const credential = await createWebAuthnCredential({
  name: 'Example',
  rp: {
    id: 'example.com',
    name: 'Example',
  },
})
```

### timeout (optional)

- **Type:** `number`

How long (in milliseconds) to wait for the user to complete the registration.

```ts twoslash
import { createWebAuthnCredential, toWebAuthnAccount } from 'viem/account-abstraction'
// ---cut---
const credential = await createWebAuthnCredential({
  name: 'Example',
  timeout: 1000,
})
```

### excludeCredentialIds (optional)

- **Type:** `string[]`

An array of credential IDs you want to prevent from being re-registered. If a user already has a credential with one of these IDs on their device, the registration will fail. Use this to prevent duplicate credentials and ensure each device can only register once.

```ts twoslash
import { createWebAuthnCredential, toWebAuthnAccount } from 'viem/account-abstraction'
// ---cut---
const credential = await createWebAuthnCredential({
  excludeCredentialIds: ['abc', 'def'],
  name: 'Example',
})
```

### createFn (optional, advanced)

- **Type:** `(options: CredentialCreationOptions) => Promise<Credential | null>`
- **Default:** `window.navigator.credentials.create`

Allows you to override the default credential creation function. By default, it uses `window.navigator.credentials.create`, which is the standard WebAuthn API. Override this only if you're in an environment that doesn't support WebAuthn natively (React Native, test environments, etc.). Pass a custom function that accepts the same options and returns a credential or null.

```ts twoslash
// @noErrors
import { createWebAuthnCredential, toWebAuthnAccount } from 'viem/account-abstraction'
// ---cut---
import * as passkey from 'react-native-passkeys'

const credential = await createWebAuthnCredential({
  name: 'Example',
  createFn: passkey.create,
})

const account = toWebAuthnAccount({
  credential,
})
```

## Error Cases

The registration can fail or be cancelled for several reasons:

- The user cancels the credential creation dialog
- The device doesn't support WebAuthn
- The credential already exists (if using `excludeCredentialIds`)
- The timeout expires while waiting for user interaction
- The authenticator is locked or unavailable

Wrap the function call in a try-catch block to handle these gracefully.
