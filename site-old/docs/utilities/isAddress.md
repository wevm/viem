---
head:
  - - meta
    - property: og:title
      content: isAddress
  - - meta
    - name: description
      content: Checks if the address is valid.
  - - meta
    - property: og:description
      content: Checks if the address is valid.

---

# isAddress

Checks if the address is valid.

## Import

```ts
import { isAddress } from 'viem'
```

## Usage

```ts
import { isAddress } from 'viem'

isAddress('0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678ac') // [!code focus:2]
// true
```

## Returns

`boolean`

Whether or not the address is valid.

## Parameters

### address

- **Type:** `string`

An Ethereum address.
