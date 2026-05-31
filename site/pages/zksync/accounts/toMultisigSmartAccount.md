---
description: Creates a multi-signature ZKsync Smart Account
---

# toMultisigSmartAccount (ZKsync)

Creates a multi-signature [ZKsync Smart Account](https://docs.zksync.io/build/developer-reference/account-abstraction/building-smart-accounts) from a Contract Address and the Private Key of the owner.

## Usage

```ts twoslash
// @twoslash-cache: {"v":2,"hash":"b6370d817ea44e01eec3183c10f52b5eb38e55122cbeefc05306a980666ad145","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvNBACyg1uLjsA5gGUAts1JoAgiJERhaRlm3MNMGqTiJeAFTkKlqzdr0GjYNAAVzl6x47AC0AazgMUTcdfUNjAB0wdg0sCB1pJ0V2ZXUtGM9jShAoCBEERBAAYVIYZho4XmZeZGCAaQjRXmi0XlivNABdRnw0NCxbAHoJkrKAOgAvcMiRWYkJgCNBdlYoaZgSVggcUgBaGv4yGFEYCeYC7xPmdbg0UjvxSQ2tnfYwFRO4Hk0I97mgeIl+KQIBpGrxKpJXu9elAoDU4A1mGAoI0pNo3hheBB+LwfKR2EQ6jBeK0YBgGusYIc/r8VBlpPgqRAAO5gMhwWZFF7uJAATiorCuKjQ+CQACZZVQ0NoVFY8DJ5Fkct0+oVxb9cIgAAxUET4cxiMiigC+FHQ2ANBGIlsVdAYFUMYBejVBISWUSBOu8gqVOiQADZjSAJX9pUgAOyK5Wqip3OJBvW8uUms1vC3kRBhm12nB4Qgkcgu+hMNicHgZDUuXLuQMmMxvAJ8uyOBvZVwB0F+dtWPncX0dETa0GJZKpdLq5y9pv5NMMKgzcpVGqUjHNNrjrpA3qgoYjMaTaalfmLcerCBfba7WAHI5kM4wC41a63UGPZ6IsQSGA94/H8AJAiCK7gmAkLQrC8LeLmPS6CiaIYliOKNKQ+KEsSpLkpS1K0vSjKSCoLJstKnI8nyApUEKoaIHGkbRlKMqIPKiakCqbrUJkjaTiuRQcJm7HZua1hIAAjIWtrUPapZOhW1CukwWBQscmB8MwKHwLYvAAAaGrQAAkwAvGSfxWvpRTrngyGorpOHslSsBYIcGAwNiLYAOQNPB/49DOEqWN4dSAbRID0W6IoJlGkqxoxnHcXg2kOeiQn6kgADMYmIZa7FFnJJYVGWzrKVWFSmOpZCabwan4TQNJ0nYW4lGArAEoZJlma8LJWcgAw2ZedlYcwBJEiSZIUjQhF0rwDJMmRfwURyhLUTYEVRVJACsAAs4rxWxkmSUlyYgPV00wE1CAZga+0gKa4n5bKVoDCa0AOjOaQ9MA9YLlq/YrrwVoCFCMLeUQ7AwBoEzXss3mJIkHpeqm/S8AAvH9mp9s2oKMMAiS8I0OnonY3lGfwWUigAYlAYYwNtknMNpAAc1NhtTu0iDAYbMAAQizLOynGwsiiI/D8NT6wivKYZht5FC8ITdVTZS112Mg5O0LMOsK7wWs67M3kDIkVrcEUATMEgoCulcyiSGqCBWlaQA==="}
import { toMultisigSmartAccount } from 'viem/zksync'

const account = toMultisigSmartAccount({
  address: '0xf39Fd6e51aad8F6F4ce6aB8827279cffFb92266', 
  privateKeys: ['0x...', '0x...']
})
```

## Parameters

### address

- **Type:** `Hex`

Address of the deployed Account's Contract implementation.

```ts
const account = toMultisigSmartAccount({
  address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // [!code focus]
  privateKeys: ['0x...', '0x...']
})
```

### privateKeys

- **Type:** `Hex[]`

Private Keys of the owners.

```ts
const account = toMultisigSmartAccount({
  address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 
  privateKeys: ['0x...', '0x...'] // [!code focus]
})
```