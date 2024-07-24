# createWebAuthnCredential

Registers a **WebAuthn Credential** designed to be used to create a [WebAuthn Account](/account-abstraction/accounts/webauthn/toWebAuthnAccount).

:::note
This function uses the [`webauthn-p256` library](https://github.com/wevm/webauthn-p256) under-the-hood.
:::

## Import

```ts twoslash
import { createWebAuthnCredential } from 'viem/account-abstraction'
```

## Usage

```ts twoslash
import { 
  createWebAuthnCredential, 
  toWebAuthnAccount 
} from 'viem/account-abstraction'

// Register a credential (ie. passkey). // [!code focus]
const credential = await createWebAuthnCredential({ // [!code focus]
  name: 'Example', // [!code focus]
}) // [!code focus]

// Create a WebAuthn account from the credential.
const account = toWebAuthnAccount({
  credential,
})
```

## Returns

`P256Credential`

A P-256 WebAuthn Credential.

## Parameters

### challenge

- **Type:** `Uint8Array`

An `ArrayBuffer`, `TypedArray`, or `DataView` used as a cryptographic challenge.

```ts twoslash
import { createWebAuthnCredential, toWebAuthnAccount } from 'viem/account-abstraction'
// ---cut---
const credential = await createWebAuthnCredential({
  challenge: new Uint8Array([1, 2, 3]), // [!code focus]
  name: 'Example',
})
```

### createFn

- **Type:** `(options: CredentialCreationOptions) => Promise<Credential | null>`
- **Default:** `window.navigator.credentials.create`

Credential creation function. Useful for environments that do not support the WebAuthn API natively (i.e. React Native or testing environments).

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
  createFn: passkey.create, // [!code focus]
})
```

### excludeCredentialIds

- **Type:** `string[]`

List of credential IDs to exclude from the creation. This property can be used to prevent creation of a credential if it already exists.

```ts twoslash
import { createWebAuthnCredential, toWebAuthnAccount } from 'viem/account-abstraction'
// ---cut---
const credential = await createWebAuthnCredential({
  excludeCredentialIds: ['abc', 'def'], // [!code focus]
  name: 'Example',
})
```

### name

- **Type:** `string`

Name to identify the credential.

```ts twoslash
import { createWebAuthnCredential, toWebAuthnAccount } from 'viem/account-abstraction'
// ---cut---
const credential = await createWebAuthnCredential({
  name: 'Example', // [!code focus]
})

const account = toWebAuthnAccount({
  credential,
})
```

### rp

- **Type:** `{ id: string; name: string }`

An object describing the relying party that requested the credential creation

```ts twoslash
import { createWebAuthnCredential, toWebAuthnAccount } from 'viem/account-abstraction'
// ---cut---
const credential = await createWebAuthnCredential({
  name: 'Example',
  rp: { // [!code focus]
    id: 'example.com', // [!code focus]
    name: 'Example', // [!code focus]
  }, // [!code focus]
})

const account = toWebAuthnAccount({
  credential,
})
```

### timeout

- **Type:** `number`

A numerical hint, in milliseconds, which indicates the time the calling web app is willing to wait for the creation operation to complete.

```ts twoslash
import { createWebAuthnCredential, toWebAuthnAccount } from 'viem/account-abstraction'
// ---cut---
const credential = await createWebAuthnCredential({
  name: 'Example',
  timeout: 1000, // [!code focus]
})

const account = toWebAuthnAccount({
  credential,
})
```
