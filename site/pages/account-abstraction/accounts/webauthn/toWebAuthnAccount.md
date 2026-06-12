# toWebAuthnAccount

Creates a **WebAuthn Account** – commonly used for **[Smart Account](/account-abstraction/accounts/smart) Owners** to sign User Operations and messages on behalf of the Smart Account.

:::note
WebAuthn Account owners are currently supported on the following Smart Account implementations:

- [`toCoinbaseSmartAccount`](/account-abstraction/accounts/smart/toCoinbaseSmartAccount#owners)
:::

## Import

```ts twoslash
// @twoslash-cache: {"v":2,"hash":"bfe427f73977f2e6f056aa9f207021954a711b5cdfb062f22126b678f3324ca5","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvNBADqMAEYBBQWnxglIkRGFpGWZqWYBbGDVJxEvACpzFKtRq06waAAqGTZsjyvzlquqa2roAOmDsxlgQpGjSdgGOwS4MVGjMAOYIKMggsHAipOxY4pKUIADCpDDMNHC8zFLJugKkEMYNvP4O6rxVMLCunKwAdCAAuhS51WiCpGAIVEpd9oFNzrpj45MgcOmxSACcVKwwYBlqSACMAOxphhlmeDLda82u5RxguIgADFQifCeMRkI4AXx22lgeEi0VivGA8VeSQ2rl4YNa7V4AHIiOwYMYAPTMVFoAC0zAUeyMYgkYGx5VM6SQoDoNAWdOeCDBYKAA==="}
import { toWebAuthnAccount } from 'viem/account-abstraction'
```

## Usage

```ts twoslash
// @twoslash-cache: {"v":2,"hash":"a553831501e0412e6805b22385951e760c4e92b44998363f094b1bcd78e9097d","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvEaRjMaAdRgAjAIKC0+MAGFZsMOLaMszUswC2MGqTiJeuuYpXrNOvTAOdWABVMWrZDx23qQQ5uxwMAA8DvIwSmoaWg76hqwASlaCpGAAKtgwAHwAOmDs5lgQpGjSsnEJLsnunmyUIHBopgyIAIwATFSsHgDmmkh9ACxUnaTDVngyjvHOSW4wqV5tHGC4vVQi+H5iZOMAvhToBXiEJOTTdN0gLBxcfEKi4pK8aBANq6oiEQQYRoYx+SzWWy8XK/FauAFAkG+MwQwLcOx/eGA4EGUrlSrVb6wxJYxEGNqdYYIFDIECwOAydhYT5gNqxGhwXjMKQInE1fihcxc3iYrT2ZppAB0IAAuhRabI0NkwAgqKoRXCxbyQdKZXL2jNuhMeoMRmNegB2aamOaPH6isDa8mDdg7cb7Q5mY7kRB9c6XHDXYgne70BaSDq1dYeNLBPoAVgAbCkY5sqB0ukgesbTWBRvgswAGa2zeaIECLDatF1uxCJj1HaxIRP+6hXcs3EPUB5MNicHhR+qatZV1hglEBGx2dnLElNaMtHzgydBXghMIRaIzh0pxeZJU5fI4EplCpVGqLIdzkep6sGzO9RPFkBDPPmyYl20LOpOa+7tJbK6uz1hWnrMN64zxq2mCBh2wZ3N2YblsYoQ4NUGB8GA/h2B0pCusMbQZtUWYABwAJy5vmSBTNQNpluA/iAbWVqgY2Jy+tB7YEPBFI9uWQIqjU4FkmgGLDk6DDpoa4wkQAzJR5osTMX7lsJfJMbsPQmqxXpNnWnGwdxty8UhTx9q8RIOhJ47+JCdgwlZ2JIsukLohq14SXiZ6Eva4lOc6tFUkgyC0vSjLMhIrJUDOnLcrwEkCIKwoOuKC5SrK8ogIqyqqiA6opRJur6kR3R9GR8kvmaBaWp+9G+R5/mSS+QFZtpBxsT6PQthcbaGZ2CE0KZKEQGhmB8JWt6sHYwClLwc28OwUBxkm/5eMgxQgItG0ygA3LN81YIIygcCIADSMAYMtyYSmtG2Hcd7BnRd217WApxtFAEAiNSIC5PgMDuY0UjeAmiZRqORK8IIkTSlJD6ybJAyVW+1U9M+yn0RNi4aVmSPtbp7F+vqQKwHg+LnrwwC8Ptl6/kDq1sBQ1NSJZfkiczpyJWEvAAOREOwMDmAA9GpIIALTMMouHgSyPOlKUQtC7wmTDBE1jCljaS8IwAuSrwJhwHAADWF3cJKpQCZGmteLwAC8XIAO7MOwF4/rO9M3UYM0s1hlh2DzACitAWFgQw8xQpSnNw8tgIrqVxMlw5co1XNCpoAPW2wetx8gACEJMA/wX3QzKFsRkJKf2/VQPWVTOf59AhfF3Apcs5nrBM/XBcCM3rdR7wXeNz3Igl20ELMEgoAPB4cCRXgaAIKcpxAA="}
import { 
  createWebAuthnCredential, 
  toWebAuthnAccount 
} from 'viem/account-abstraction'

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
// @twoslash-cache: {"v":2,"hash":"ff776defb5d202c71dbbfebe4d81838ea10ae0d0d7f6d0d8e974b8b13c5f5a1e","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjCMONAAkdJljDQEsAhgBtE7AAoAmAKwA2AMLdeAkZRBtBpBollVhMMAHM0+JAEYADFTSbDMbSC48DK4WuH8wuRFcf5Ngow05DoAvhTo2N4ExGRqNPR4ABQiQnAAlJzcgjQA6jAARgCCAK4mYIrOfELCSVgBALb2ZHBilTkw+cVl+BVKLjXijc2kGWLipBAN/HAwADzteYWl5ZXKNQBK9iWkYAAqUQB8ADpg/A1YEFpZMB1dK71rA6pUGlpIMnoGxqaIkgAs1ls9iY2SW3VW/WqLxAHi8SF8jH8pECwQ+0nCkRweEIJHI1joDjqkxwWgwmTAgiaYjYpE8hjUb200kBsO+JiQrJspDsDkpTXcnm8ZioSICQTif0x1CiONi+OohKYLDY7ECzBKfDE9x6YCKjA1fEZ3O0AA4RWyjBzEAB2IE8kGIEDqiCahh6IWc0XI1GS2TSzDYp24uIExJOlIeQQZdhoCA68r6w1oOrDYKtdh7ePLXVJ118IYoprp9LanOJg35tCnc6Xa5xhO9PNu+KCQwIFDIECwOBcfhYAQsNSLeBqsDsZt8dgAM0mDTV7Eb46e0OEADoQABdChd7hoHasNRFRfl3oTytujeb7fqE1IACcFv0Vt+Zjt1GBDgbp71F6NHvhRBWTFFEJRCMx/QiGUgxiPF4iVCMsBJMhMEyJx1hEMRgFOdhcPYfgoHGGQFChVxkGOEACIozcAG4cLwrASgKDxGAAaRgDAiLkFcyIoxjmP4NiOOouiwFCNQoAgRgOxAPZ8BgE8ITPKQ5BuDDhFjCB2BKWYN1eO9EDMMwAGYvhfcxfG5XlQSqVxBUA6RvXFNEpRvZhYGVVgOHQ54NIAXjVAB3QR+G8sFOh/HiaiSbDx3YfkYDEAByABRWgqSwfQkooU5QnSU5TmYLy1T/DgAu/JTf2TGL6J81cKHYAB6Rr2GQABCdyFOnKSdM3XL0jUYtBCQUBCQMOB+CHJ00AQUJQiAA=="}
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
// @twoslash-cache: {"v":2,"hash":"d8a987182014a0e586916804b01cf98639ad00550390b48f156a1f2e32f761e6","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BLAWywlLQAIsBDOOANYwMlEHDQ8OSAIwAmKgBsYYAOZp8SAOxUJpFTAaIQvfkJGLGYXIgAMVAMb5JPezXKI5AXwrps1gsRkojT0ePYQYOKc9qQwsGBojDwKiJwACrIArABsAMKx8YnJouKShpoAzIrKahoedtSS+oYgMXHKRQqiCpbW8q1OpC5uSNnevjh4hCTkOnQtABTJSXAAlNGxPDQA6jAARgCCAK7qYPntCUkKC7xDzAZkcKnnWzC7hyf4ZwUdV2nO9zca1SaVIEGYjDgMAAPC8dvtjqdzoUrgAlAxHUhgAAqfgAfAAdMAsNgcDYwV7vRFfZG/YpUUpSRAATn6SlU6iQsgALDomgYwpt4R8kT9LvSQD0rFyHINhkFEFlxtQ/FNArNqPM8DcwTgOBh1mAePdUuJSJYVCVdIY5NJqhy6rzGnoBUYjfdur0kFUBs5XArZMrMJMjNMgnNQkZwpEuC5wkcEqkqZ8wAd7PGElayjJuQAOe21LR8l0tOMQBMMCzSxDZWV+kY1oOq0Pq4JaoxLHp8dZoCDJ05pjNoG4Ah6kJ6cbF9hEpwflhL/O5j4GcftfOcVokk9hcXtr1Pp+eVxoqBAoZAgWBwGKMLCJCKiOHwTg8MCcDcJTgAMzBzBfq5nU5OFpcUFAAOhAABdCgL1iNBMUiUQDgAkUvnfQ8KwgyDoLEa0ZEyfNJRqTkPG0Z1mjwPdAPXDDMyraxa19IZ/XcaQxh8FUQwCGY20jEAdQgPVMHWNoUWSVJgCJThpM4RgoBBLI8jFTpkAJEA5LUyCAG4pJkrAjj2Hp7AAaWEBSchAlS1P0wzGBM4RNJ0sBPFEKAIHsM8QGxfAYBQ6k3wyHJyTEhROF7TgjihCCGTwjxcwadlC3qYsKKjZSrk9asyMcesAybLiww1EJFiwXUyGEzhmgAMTAAB+VIFgWQT70iergPS5J0QARyOeA0AAeTvRgIjgTgAB8IrAWAv16KB1gAXjxdJf0hGFLKucbODAI4FAUPF1gmhNptm1z3M89bkk4WIer678E1cYawDAzgAFUoS/Hbv3YThlCIRgwTAe4ElG9Qtk4NytogLg4COLBSTQIl1F8/d3zSABJLatkYEgFAwTgFkYMCYGe9Fhk4AA5LGSE4b6aHEC0frAP6AaBtA1mik8z2QC9pp4HbjwAd0sNyBbAo0/pULZ2DA0S6QUOAwIo7CYuzDxmSdRKSMyFLXRAaqwEy6xCJy5iG0DDjg38QreJabcyRMQRhCzJlZBsO0iIdItyN1h2zENpBjblFikGZfKrdbCNSzAcxcNV13mQLEifV0VK9YFeiA7rU2FWkTRPBw8JYCYVgd04AAqF9Rt94Rv1/TgAHJNlcABaI1EhIZvq4wOB684AB6PvOGQABCQvfK/dzIsgokiWjKJZdAzh5pfAWeEYLg2kpajvguToFkkt9MZNBuAFFaGNLAlHrigiU8VYZ7AOfY1orhl6o1CDyHffdIXzob8P/WqQu6KwMBQfug8R5jy+vYKet9ViiEBDwJAoB5jKDgI9SiCBPCeCAA=="}
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
// @twoslash-cache: {"v":2,"hash":"24a6043c2a34e009e334abd16f187921136a9b162a5877449924dec09c7d19ae","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BLAWywlLQAIsBDOOANYwMlEHDQ8OSAIwAmKgBsYYAOZp8SAOxUJpFTAaIQvfkJGLGYXIgAMVAMb5JPezXKI5AXwrps1gsRkojT0ePYQYOKc9qQwsGBojDwKiJwACrIArABsAMKx8YnJouKShpoAzIrKahoedtSS+oYgMXHKRQqiCpbW8q1OpC5uSNnevjh4hCTkOnQtABTJSXAAlNGxPDQA6jAARgCCAK7qYPntCUkKC7xDzAZkcKnnWzC7hyf4ZwUdV2nO9zca1SaVIEGYjDgMAAPC8dvtjqdzoUrgAlAxHUhgAAqfgAfAAdMAsNgcDYwV7vRFfZG/YpUUpSRAATn6SlU6iQsgALDomgYwpt4R8kT9LvSQD0rFyHINhkFEFlxtQ/FNArNqPM8DcwTgOBh1mAePdUuJSJYVCVdIY5NJqhy6rzGnoBUYjfdur0kFUBs5XArZMrMJMjNMgnNQkZwpEuC5wkcEqkqZ8wAd7PGElayjJuQAOe21LR8l0tOMQBMMCzSxDZWV+kY1oOq0Pq4JaoxLHp8dZoCDJ05pjNoG4Ah6kJ6cbF9hEpwflhL/O5j4GcftfOcVokk9hcXtr1Pp+eVxoqBAoZAgWBwGKMLCJCKiOHwTg8MCcDcJTgAMzBzBfq5nU5OFpcUFAAOhAABdCgL1iNBMUiUQDgAkUvnfQ8KwgyDoLEa0ZEyfNJRqTkPG0Z1mjwPdAPXDDMyraxa19IZ/XcaQxh8FUQwCGY20jEAdQgPVMHWNoUWSVJgCJThpM4RgoBBLI8jFTpkAJEA5LUyCAG4pJkrAjj2Hp7AAaWEBSchAlS1P0wzGBM4RNJ0sBPFEKAIHsM8QGxfAYBQ6k3wyHJyTEhROF7TgjihCCGTwjxcwadlC3qYsKKjZSrk9asyMcesAybLiww1EJFiwXUyGEzhSCwABJKAAH5TTQc1VE4AAfCKwFgL9eigVz3M87zfNiBQMAtbgygwWSUW6sgwogCKoqzJlpGZJ1EpIp1dFSkAqtqzLrEInLmIbQMcPCWAmFYHdOAAKhfOBxtMYRv1/TgAHJNlcABaI1EhIL6TEEYQ4DezgAHowc4ZAAEJzt8r93MiyCiSJaMolEulQoAXhfAB3HhGC4NpKWo74Lk6BZJLfTh3RgVI3oAUVoY0sCUN6KCJTxVhRsA0djWiuBxqjUIPIdKd0jHQI56ndvk966BZpQwPCZh2fByGYbh79EbgZHnNWURAR4JBQHmZQ4EYB8jDQBBPE8IA=="}
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