---
head:
  - - meta
    - property: og:title
      content: hashMessage
  - - meta
    - name: description
      content: Hashes arbitrary string in Ethereum Specific Format.
  - - meta
    - property: og:description
      content: Hashes arbitrary string in Ethereum Specific Format.

---

# hashMessage

Calculates an Ethereum-specific hash in the form of `keccak256("\x19Ethereum Signed Message:\n" + len(message) + message))`.

## Import

```ts
import { hashMessage } from 'viem'
```

## Usage

```ts
import { hashMessage } from 'viem'

hashMessage('Some data') // [!code focus:2]
// 0xb1ffabbf8c051d2e5ecee0b69621eec616823c3fd329974590ef274cb9d54220
```

## Returns

[`Hex`](/docs/glossary/types#hex)

Returns the hashed message

## Parameters

### data

Any string data

- **Type:** `string`

 
