---
description: Creates a ZKsync Smart Account
---

# toSmartAccount (ZKsync)

Creates a [ZKsync Smart Account](https://docs.zksync.io/build/developer-reference/account-abstraction/building-smart-accounts) from a Contract Address and a custom sign function.

## Usage

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"8e9e26da04db224c727e059b85b01e93eb944ee35269c0d9d1d51b55dbb00f37","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvNBADKAW2ak0AQREiIwtIyxLm8mDVJxEvACpzFytRq0AFPQaM9TALQDWcDKIVLV6zTA0AB0wdnksCGVpSz8bQIYqKAgRBEQQAGFSGGYaOF5mXmRXAGkvUV5faPitAF1GfDQ0LBMAelbk1IA6AC9PbxEuiVaAI0F2VigOmBJWCBxSAFps/jIYURhW5gCtReYRuDRSbfFJUfHJ9jAAc0W4KzQ9naCeUP5SCHkC3gzJI5PeCooFBsnB8swwFBviJBIdPrw4OxrlIhKJTmAupQQIc/EgAJxUVjra5ofBIACMABYqGglNdDHgZFV/LYgliOGBcIgAAxUET4PRiMj4gC+FHQ2C5BGIwppdAY6Q0YEOBWeaDc/R8DxqbKoOOUSAArAAmQnE0lIADsNLpDPS21ZiRAHK5ppA/MFRiQADYxRKcHhCCRyHL6Ew2JweDFmTrtLpjk4yCZzLFrGqHAnDEnuBryiIY2rQuFItEmdq1VjOmlMtlcvBvsUygNKg9AWr6o1mm0Oik4L1NYNhmMJlNYLN5mRljBVtkNls1XsDv8xBIwOcR1dbvc/E9Ha8wO94YVfkFjmJAcDQeDIdDYTIvojkQJhCvJJi9bSDYhvW6iTcLYgVI2qQ9IKtQqYsgk7JXK6fICmeXqAb64rUJKgYyiG1DykwWAfAsmB8Mwl7wMmAAG3K0AAJMAhykJuIqkZWvZ4ECIIkbwED8NI+AwLwsBYHMGAwFCsYAOT5Cey5oLwxZEgYQS5Ku77Yp+CoABzkma/5kog1rULaYFEWxYLQZySAAMxwZ6wqIMafqoQG6RBrKWFhukOh4WQBEIkiYCmDojhZsYpjAKEvDhbwApwPgpgABJcPgADcoQinwAC8AB8vB2B88jsHAMAADyxXQGVMakeAAGIvuiMQ+U+hRRfgyn6gqVLUs65o6R1n6gXgj5gKZXIdR6CE2Wp9mYI50rBliNBuSAAWZkYfBNaY5FUTRRz0YxH64oBhqaZ12lID1BmBglQ2nVZY3kAdIq1Hy0BSsWUTScA0blo6vAigIuW8KJRDsDA8itH0eaiaEoRKiqDoJLwaWfXEaqMKFUgFMRYKmKJFH8OZeKVVA3owIdzBEWplXepVlIiDA3rMAAQmpanGparN4iI/D8JVIx4saxret6okULwYUFHm9VgKjkUJT9fBoxFvDtLwXSq5Lm68HM1zsCIYvhdkaCCKQUg47QqtdJD6Miil3BYk4zBIKA8rrIikiMggIoikAA="}
import { toSmartAccount } from 'viem/zksync'

const account = toSmartAccount({
  address: '0xf39Fd6e51aad8F6F4ce6aB8827279cffFb92266', 
  async sign({ hash }) {
    // ... signing logic
    return '0x...'
  }
})
```

## Parameters

### address

- **Type:** `Hex`

Address of the deployed Account's Contract implementation.

```ts
const account = toSmartAccount({
  address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // [!code focus]
  async sign({ hash }) {
    // ...
  }
})
```

### sign

- **Type:** `({ hash: Hex }) => Hex`

Custom sign function for the Smart Account.

```ts
const account = toSmartAccount({
  address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 
  async sign({ hash }) { // [!code focus]
    // ... // [!code focus]
  } // [!code focus]
})
```