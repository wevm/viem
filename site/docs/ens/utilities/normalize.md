---
head:
  - - meta
    - property: og:title
      content: normalize
  - - meta
    - name: description
      content: Normalizes ENS name to UTS46.
  - - meta
    - property: og:description
      content: Normalizes ENS name to UTS46.

---

# normalize

Normalizes ENS name to [UTS46](https://unicode.org/reports/tr46).

## Import

```ts
import { normalize } from 'viem/ens'
```

## Usage

```ts
import { normalize } from 'viem/ens'

normalize('wagmi-d𝝣v.eth') // [!code focus:2]
// 'wagmi-dξv.eth'
```

## Returns

`string`

The normalized ENS label.

## Parameters

### name

- **Type:** `string`

A ENS name.