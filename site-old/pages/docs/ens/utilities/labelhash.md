---
description: Hashes ENS label.
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

:::warning
Since ENS names prohibit certain forbidden characters (e.g. underscore) and have other validation rules, you likely want to [normalize ENS labels](https://docs.ens.domains/contract-api-reference/name-processing#normalising-names) with [UTS-46 normalization](https://unicode.org/reports/tr46) before passing them to `labelhash`. You can use the built-in [`normalize`](/docs/ens/utilities/normalize) function for this.
:::

## Returns

`string`

The hashed ENS label.

## Parameters

### name

- **Type:** `string`

A ENS label.
