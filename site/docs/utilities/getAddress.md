---
head:
  - - meta
    - property: og:title
      content: getAddress
  - - meta
    - name: description
      content: Converts an address into an address that is checksum encoded.
  - - meta
    - property: og:description
      content: Converts an address into an address that is checksum encoded.

---

# getAddress

Converts an address into an address that is [checksum encoded](https://eips.ethereum.org/EIPS/eip-55).

## Import

```ts
import { getAddress } from 'viem'
```

## Usage

```ts
import { getAddress } from 'viem'

getAddress('0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678ac') // [!code focus:2]
// '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC'
```

## Returns

[`Address`](/docs/glossary/types#address)

The checksummed address.

## Parameters

### address

- **Type:** `string`

An Ethereum address.
