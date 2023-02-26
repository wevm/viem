---
head:
  - - meta
    - property: og:title
      content: labelhash
  - - meta
    - name: description
      content: Hashes ENS label.
  - - meta
    - property: og:description
      content: Hashes ENS label.

---

# labelhash

Hashes ENS label.

## Import

```ts
import { labelhash, normalize } from 'viem/ens'
```

## Usage

```ts
import { labelhash, normalize } from 'viem/ens'

labelhash(normalize('awkweb')) // [!code focus:2]
// '0x7aaad03ddcacc63166440f59c14a1a2c97ee381014b59c58f55b49ab05f31a38'
```

::: warning
A label must be [normalized via UTS-46 normalization](https://docs.ens.domains/contract-api-reference/name-processing) before being hashed with labelhash. 
This can be achieved by using the `normalize` utility.
:::

### 

## Returns

`string`

The hashed ENS label.

## Parameters

### name

- **Type:** `string`

A ENS label.