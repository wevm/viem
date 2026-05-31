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
// @twoslash-cache: {"v":1,"hash":"599e10a2debc38c6034de366f5049475219a219f6a36d93f9b335458e948c961","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvEaRjMaAdRgAjAIKC0+MAGFZsMOLaMszUswC2MGqTiJeuuYpXrNOvTAOdWABVMWrZDx23qQQ5uxwMAA8DvIwSmoaWg76hqwASlaCpGAAKtgwAHwAOmDs5lgQpGjSsnEJLsnunmyUIHBopgyIAJxUrB4A5ppIAEwALFSdpINWeDKO8c5JbjCpXm0cYLiIAAxUIvh+YmRIPQC+ALoH0Dsg5ZXVvMC1iw0rKR5pvOcCoea8ADkRHYMHMAHpmCIRBBhGgALTMZQdMxiCRgQFtSydJCgOg0MBwdF4NAIc7nIA==="}
import { createWebAuthnCredential } from 'viem/account-abstraction'
```

## Usage

At minimum, you need to provide a name to identify the credential:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"a132f90dbfe126488a0d3b8119eb6d3c0367f100f84422f8259f91418f8e80ce","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvEaRjMaAdRgAjAIKC0+MAGFZsMOLaMszUswC2MGqTiJeuuYpXrNOvTAOdWABVMWrZDx23qQQ5uxwMAA8DvIwSmoaWg76hqwASlaCpGAAKtgwAHwAOmDs5lgQpGjSsnEJLsnunmyUIHBopgyIAIwATFSsHgDmmkh9ACxUnaTDVngyjvHOSW4wqV5tHGC4vVQi+H5iZOMAvhToBXiEJOTTdN0gLBxcfEKi4pK8aBANq6oiEQQYRoYx+SzWWy8XK/FauAFAkG+MwQwLcOx/eGA4EGUrlSrVb6wxJYxEGNqdYYIFDIECwOAydhYT5gNqxGhwXjMKQInE1fihcxc3iYrT2ZppAB0IAAuhRabI0NkwAgqKoRXCxbyQdKZXL2jNuhMeoMRmNegB2aamOaPH6isDa8mDdg7cb7Q5mY7kRB9c6XHDXYgne70BaSDq1dYeNLBPoAVgAbCkY5sqB0ukgevGAJymsCjfBZgAM1tm80QIEWG1aLrdiETHqO1iQif91CulZuIeoDyYbE4PCj9U1axrrDBKICNjs7OWJKa0ZaPnB06CvBCYQi0TnDpTy8ySpy+RwJTKFSqNUWI4XY9TtYNmctAA584XxlNqDaK1W6k5b/uaRbK6uyNlWnrMN64zxu2mCBl2wZ3L2YaVsYoQ4NUGB8GA/h2B0pCusMbQZtU4yTG+5qfjMtp4DhljAfWVrgc2Jy+rBnYEIhFJ9pWQIqjUkFkmgGKjk6DDpoaSAAMxSfGFFFogTHUT+gl8gxuw9CazFei2DbsfBnG3NxKFPAOrxEg6YmTv4kJ2DClnYkiq6QuiGq3mJeIXoS9qiY5zpflSSDILS9KMsyEislQc6ctyvBiQIgrCg64pLlKsryiAirKqqIDqslYm6vqJHdFJExySAQwFuaPRKd+drEo0jp+eJFUgVmWkHCxPo9G2FwdgZ3ZITQJloRAGGYHw1b3qwdjAKUvALbw7BQHGSaAV4yDFCAy1bTKADc82LVggjKBwIgANIwBgq3JhKG1bcdp3sBdV27QdYCnG0UAQCI1IgLk+AwG5jUbgmiZRuORK8IIkTShJT5SYmTGVe+vSll+5aPFNy7qVmAzaZBul+vqQKwHg+KXrwwC8Id17/o161sBQNNSBZvlCSzpwJWEvAAOREOwMDmAA9KpIIALTMMo+GExFvOlKUwvC7wmTDBE1jCtjaS8IwguSrwJhwHAADWV3cPrSu8MgACEpNA/wP0wzKLN8ZGWteLwAC8XIAO7MOwV5/vODN3UY1OWzbdsCI7cAyoddEwHYvMAKK0BYWBDLzzMR7b0D2zHccfXwOdRw7IhOwrYCW3OSWjlyzXc0KmhA+7bCSqUrsCQ33s+e5zWMHNrOt6wFClKc3BtBCzBIKADweHAEV4GgCCnKcQA"}
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
// @twoslash-cache: {"v":1,"hash":"05e1711eade54140b0b83b8fa3c1edd36f70bfbf1431867b99000821019692d6","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjCMONAAkdJljDQEsAhgBtE7AAoAmAKwA2AMLdeAkZRBtBpBollVhMMAHM0+JAEYADFTSbDMbSC48DK4WuH8wuRFcf5Ngow05DoAvhTo2N4ExGRqNPR4ABQiQnAAlJzcgjQA6jAARgCCAK4mYIrOfELCSVgBALb2ZHBilTkw+cVl+BVKLjXijc2kGWLipBAN/HAwADzteYWl5ZXKNQBK9iWkYAAqUQB8ADpg/A1YEFpZMB1dK71rA6pUGlpIMnoGxqaIkgAs1ls9iY2SW3VW/WqLxAHi8SF8jH8pECwQ+0nCkRweEIJHI1joDjqkxwWgwmTAgiaYjYpE8hjUb200kBsO+JiQrJspDsDkpTXcnm8ZioSICQTif1CAF1RdBosxWBwnOsROwALzsQQAd0E/GVYM6yx6fSqriSwFO7HY/JgYgA5ABRWhUrD6e0UU6hdJqJo2JCgQkGOD8Fh4NAIUKhIA"}
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
// @twoslash-cache: {"v":1,"hash":"9bcb44cb44fe0d20a3c00642cc92775ede1a13a0bc7bf54693eb799341993b8b","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjCMONAAkdJljDQEsAhgBtE7AAoAmAKwA2AMLdeAkZRBtBpBollVhMMAHM0+JAEYADFTSbDMbSC48DK4WuH8wuRFcf5Ngow05DoAvhTo2N4ExGRqNPR4ABQiQnAAlJzcgjQA6jAARgCCAK4mYIrOfELCSVgBALb2ZHBilTkw+cVl+BVKLjXijc2kGWLipBAN/HAwADzteYWl5ZXKNQBK9iWkYAAqUQB8ADpg/A1YEFpZMB1dK71rA6pUGlpIMnoGxqaIkgAs1ls9iY2SW3VW/WqLxAHi8SF8jH8pECwQ+0nCkRweEIJHI1joDjqkxwWgwmSRIn0RhgYgAqp40AAOIqkFEYOas9kAIRKADM+WRDmo3tppIDYd8TEgAJxA0h2ByU4TUuzuTzeMxUSkooJxP6Y6hRHGxfHUQl4IiadgMvgstmCDD0xn29nyFhsUglIJXU5eADu7CSMH0TT4rXYAElgoICvo5mASg0CkLMgBeQ42l1cx2ch0YXkCoVBgDUsnYpuEEEEUAyIps7x0cslRmliEs8sVeFtzJzGHV8Pb2uRqP1ZgA7IbMNjEDE8fELbPiRBSZhMmBBE0xJ7PIZ65ptDKJaq2xKG13ZxumgPvJJhwE9SFJKEALra6DRZisDhOdYidhpuwgj+oI/A/mCnTLD0fRVK4STAKc7CcP4KrfLS7ABlmdp9kkyBauwd7sAAzC+6QUIhGGbuhADkACitCblg+jUeRYChOkahNDYSCgISBhwPwLB4GgCChKEQA"}
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
// @twoslash-cache: {"v":1,"hash":"2e2ada4261ec8fe97356cd1bea8970d49f494c3197aa9806de959b169e4eae78","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjCMONAAkdJljDQEsAhgBtE7AAoAmAKwA2AMLdeAkZRBtBpBollVhMMAHM0+JAEYADFTSbDMbSC48DK4WuH8wuRFcf5Ngow05DoAvhTo2N4ExGRqNPR4ABQiQnAAlJzcgjQA6jAARgCCAK4mYIrOfELCSVgBALb2ZHBilTkw+cVl+BVKLjXijc2kGWLipBAN/HAwADzteYWl5ZXKNQBK9iWkYAAqUQB8ADpg/A1YEFpZMB1dK71rA6pUGlpIMnoGxqaIkgAs1ls9iY2SW3VW/WqLxAHi8SF8jH8pECwQ+0nCkRweEIJHI1joDjqkxwWgwmTAgiaYjYpE8hjUb200kBsO+JiQrJspDsDkpTXcnm8ZioSICQTif0x1CiONi+OohOSWBJZEwmVIWDEwFO7D17H4UBpaDpRgA3Lr9fyYMbTYYLWBQozudoAOwAZi+Rg5fyBPJBiBAmsF8N9fnFaKlERl2MDuLiBMSgeJEFJ6oNRvYtPpzs02gAHJ62d7fpI/by8IaQ94i2KURKQv9pZhYzE8fElcmVam1eT2NbbTnXi7zBZdMWfpzywHwFTcHohVPw/XI02ALqi6DRZisDhOdYidgAXnYggA7oJ+HuwZ1lj0+lVXEkdWA9QP2AByACitCpWH0H4UJamrapaeqGmIH50H++gAHTMA0gFgf2c6QT+MEwEhr7sOEpyhOkahNDYSCgISBhwPwLB4GgCChKEQA==="}
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
// @twoslash-cache: {"v":1,"hash":"b99b7c87320c1af94ae83c5fef908c1fe162b3dc36721248080876850cba7f30","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjCMONAAkdJljDQEsAhgBtE7AAoAmAKwA2AMLdeAkZRBtBpBollVhMMAHM0+JAEYADFTSbDMbSC48DK4WuH8wuRFcf5Ngow05DoAvhTo2N4ExGRqNPR4ABQiQnAAlJzcgjQA6jAARgCCAK4mYIrOfELCSVgBALb2ZHBilTkw+cVl+BVKLjXijc2kGWLipBAN/HAwADzteYWl5ZXKNQBK9iWkYAAqUQB8ADpg/A1YEFpZMB1dK71rA6pUGlpIMnoGxqaIkgAs1ls9iY2SW3VW/WqLxAHi8SF8jH8pECwQ+0nCkRweEIJHI1joDjqkxwWgwmTAgiaYjYpE8hjUb200kBsO+JiQrJspDsDkpTXcnm8ZioSICQTif0x1CiONi+OohOSWBJZEwmQETQgZTEYBKDQKcVe3O0AHYAMxfIwcxCmoE8kGIajnGDahh6IUfUXI1GSyShAC6oug0WYrA4TnWInYAF52IIAO6CfgRsGdZY9PpVVxJYCndjsfkwMQAcgAorQqVh9CWKPn2JrXTr2JYLFZTqF0momjYkKBCQY4PwWHg0AhQqEgA==="}
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
// @twoslash-cache: {"v":1,"hash":"e85cb7bf992c94af1950bac742c42e19494d6d71dfb99fc7fb8465aa17b9c73f","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjCMONAAkdJljDQEsAhgBtE7AAoAmAKwA2AMLdeAkZRBtBpBollVhMMAHM0+JAEYADFTSbDMbSC48DK4WuH8wuRFcf5Ngow05DoAvhTo2N4ExGRqNPR4ABQiQnAAlJzcgjQA6jAARgCCAK4mYIrOfELCSVgBALb2ZHBilTkw+cVl+BVKLjXijc2kGWLipBAN/HAwADzteYWl5ZXKNQBK9iWkYAAqUQB8ADpg/A1YEFpZMB1dK71rA6pUGlpIMnoGxqaIkgAs1ls9iY2SW3VW/WqLxAHi8SF8jH8pECwQ+0nCkRweEIJHI1joDjqkxwWgwmTojGEJVgT2hwgAklBWuw2KRPIZkABdNRvbTSQGw74mD6+GykOwOSnU2lQ1xMhB6TzeMxUJEBIJxP6Y6hRHGxfHUQnJLAksiYTJgQRNMRsjm88XaACcgv0RhFiEF4sleCtTXcyo+auRqK1klCXLV0GizFYHCc6xE7AAvOxBAB3QT8eNgzrLHp9KquJLAU7sdjSmkwOny5liZAAckEBUYDYo7AbsAAZg3I2X2H6YGIGwBRWjWrD6NunULpNRNGxIUCEgxwfgsPBoBChUJAA="}
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
// @twoslash-cache: {"v":1,"hash":"e4e73504b308cd6760b1e10af5f787b306d4464428afb860a244913bc3126d24","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BLAWywlLQAIsBDOOANYwMlEHDQ8OSAIwAmKgBsYYAOZp8SAOxUJpFTAaIQvfkJGLGYXIgAMVAMb5JPezXKI5AXwrps1gsRkojT0ePYQYOKc9qQwsGBojDwKiJwACrIArABsAMKx8YnJouKShjmKymoaHnbUkvqGIDFxykUKogqW1vLNTqQubkjZ3r44eIQk5Dp0TQAUyUlwAJTRsTw0AOowAEYAggCu6mD5rQlJCnO8A8wGZHCppxsw2/tH+CcFbRdpzrduK1SaVIEGYjDgMAAPE8trtDsdToULgAlAwHUhgAAqfgAfAAdMAsNgcNYwZ6veEfRHfYpUUpSRCaTKVVTqJCyAAsOgaBjC61hbwRX3OtJAXSs7Ic/UGQUQWVG1D8E0C02oszwVxBOA4GFWYB4t1S4lIlhUJV0hmkNi5YqqbMQNt0jTw+tunW6SAAzFLnK5ZbIFZhxkZJkEZqEjJqINrMKsWs8AGJgVI8MDmMQWmSyb221k1AAc3L0vKM8ZoSfdEodPoGfvcAZ8iuDASmwXVRiJ7C4JkEwnNZRknpzSjzWiLzqMPbMlesNscvqGHgbY38odVISaqfT9MtHOkLOqw3HJea/NwFirc+ldfZNkDSpDKrbEeaESiLnCBwSqQp7zAe3sT8En7BlpEyABOA97W0epi03QCIC/BgL2sGD51rRcRkbINVyfcN5kWPhVjQCBf2OACgLQK4/juUgHk4TFSLhP8KMQhJfhuWjAU4MiPlYpCCU7EkSN4/8EKQ4IeBUBAUGQEBYDgGJGCwRIIlEGF4E4VNOH4hJOAAMxBZgtJ45jjk4akRQUAA6EAAF0KDk2I0HRSJRD2UzBQ+HTxISWy7IcjMBw8bJINzQ8PBgp0TxEsy+N85CxQ9RkaxldxpCwldlVbfCNSwLUyFjUkkWSVJgAJThKs4RgoCBLI8mFdpkDxEAapauyAG4KqqrADh2Lp7AAaWEOqckspqWt6/rGCG4R2q6sBPFEKAIHsGSQExfAYE8ykwHSerippBROBIzgDghWy6UzDxwP3cL7StY8mhaEqOhQpBCz6Bd/U8QLwlgJhWC7TgACotLgbg+F7DADKMzgAHJ1lcABafVEhIZGp2EOB4YJAlwkiLgXqOzgAF4tIAdx4RgibPUTxouOZyr2zhXRgVJ4YAUVoA0sCUeGKG6ssYCTVIsYwazhcFxbljxsACffBKyZOpivLEyimaFxqLmlzxllEf4eCQUBZmUOBGDUow0AQTxPCAA=="}
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
