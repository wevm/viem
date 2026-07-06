---
description: Hashes ENS name.
---

# namehash

Hashes ENS name.

## Import

```ts
import { namehash, normalize } from 'viem/ens'
```

## Usage

```ts
import { namehash, normalize } from 'viem/ens'

namehash('wevm.eth') // [!code focus:2]
// '0xf246651c1b9a6b141d19c2604e9a58f567973833990f830d882534a747801359'
```

:::warning
Since ENS names prohibit certain forbidden characters (e.g. underscore) and have other validation rules, you likely want to [normalize ENS names](https://docs.ens.domains/contract-api-reference/name-processing#normalising-names) with [UTS-46 normalization](https://unicode.org/reports/tr46) before passing them to `namehash`. You can use the built-in [`normalize`](/docs/ens/utilities/normalize) function for this.
:::

## Returns

`string`

The hashed ENS name.

## Parameters

### name

- **Type:** `string`

A ENS name.