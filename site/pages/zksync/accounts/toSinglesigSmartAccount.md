---
description: Creates a single-signature ZKsync Smart Account
---

# toSinglesigSmartAccount (ZKsync)

Creates a single-signature [ZKsync Smart Account](https://docs.zksync.io/build/developer-reference/account-abstraction/building-smart-accounts) from a Contract Address and the Private Key of the owner.

## Usage

```ts twoslash
// @twoslash-cache: {"v":2,"hash":"7bf9b211c615f0396a6bad0e26078ad3836f92a1c406091e5fc153d670a38282","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvNBADK7MAHNW8dotkBbZqTQBBESIjC0jLNuYaYNUnES8AKnIXLV6rTv2HjABXOXrPHYAWgDWcBiimtp6BkZgaAA6YOwaWBA60k5KKnBqUR6xxpQgUBAiCIggAMKkMMw0cLzMvMhBANLhorz5aLyecWgAuoz4aGhYtgD0k6XlAHQAXmERInMSkwBGguysUDMwJKwQOKQAtLX8ZDCiMJPMhfGnzBtwaKT34pKb27vOp3DuNBPB5oHhJfikCAaJq8KqSN4fPpQKC1OCNZhgKAw7ykdhEeowXhtGAYXgbGBHJTOTLSfCEiAAdzAZDmxVe0SQAE4qColGh8EgAEwAZioaG0iiseBk8myrh6/SKPIUuEQAAYqCJ8OYxGQuQBfCjobCqgjEPViugMSqGMCvJog4LLSKAxXxNninRIABsAEYeddFPykAB2MUSqWVe5ed3K5lCzXa9668iIb2G404PCEEjkS30JhsTg8TKyly5NzRN0mMzvfxkWwOLLlvKukG+OtWBvcJ2dEQKkFJFJpDIy5w5VtVkHFWYVaq1AnolrtPvdQF9EHDUbjKYzMpwRbO1brLY7PawQ7HMjnGCXWo3O4gp4vBFiCRgb5nv4A6LAmOg7hwUhaFmjheJk16XRkVRdFMWxXF8RoIkSTJClJEUakZFpekmRZD0OUQEN/RAXkgwFRARXDUhJWtahmwnSsCn/YoOHjCjEx1awkF9dMjWoE1s3NPNqCtJgsEhE5MD4ZhoPgRsAAM1VoAASYBXlxJR9Xkmd9zwKCUTk3gIH4bDeFgLAjgwGAsWrAByRowNfXphxUSx4nqd9WSodkvUQTluRIwNg0IqiaLwGSDLRFiVSQUUQC1Ti9QojN+KzSocwtESC0qUwJLIKTeHEvECWJDA7EUlS1LeZwtJ08o8BxYqkNKoyTP5HDmVILyQB861fQAVm9AM+XI30NWoCNaKKxCYFK6K2IAFg4iCksFfVBk1aBTWHdJemAUtx3lNt/14fUBGA3hbKIdgYA0SYlj7WykiSW17WjAZeAAXgOuUKwHf9GGAJJeCaWS0TsWylP4YVOQAMSgb0YH631mBkgAOWHvVhhaRBgb1mAAITRtHBRDUnOREfh+FhjZOUFQVvW9WyKF4YHCoQkqSQhpS5l5p6wH1bhin8ZgkFAK1rlySRpQQfV9SAA"}
import { toSinglesigSmartAccount } from 'viem/zksync'

const account = toSinglesigSmartAccount({
  address: '0xf39Fd6e51aad8F6F4ce6aB8827279cffFb92266', 
  privateKey: '0x...'
})
```

## Parameters

### address

- **Type:** `Hex`

Address of the deployed Account's Contract implementation.

```ts
const account = toSinglesigSmartAccount({
  address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // [!code focus]
  privateKey: '0x...'
})
```

### privateKey

- **Type:** `Hex`

Private Key of the owner.

```ts
const account = toSinglesigSmartAccount({
  address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 
  privateKey: '0x...' // [!code focus]
})
```