---
description: Parses human-readable ABI parameter into ABI parameter.
---

# parseAbiParameter

Parses human-readable ABI parameter into [`AbiParameter`](/docs/glossary/types#abiparameter). Re-exported from [ABIType](https://abitype.dev/api/human#parseabiparameter-1).

## Import

```ts
import { parseAbiParameter } from 'viem'
```

## Usage

```ts
import { parseAbiParameter } from 'viem'

const abiParameter = parseAbiParameter('address from')
//    ^? const abiParameter: { type: "address"; name: "from"; }
```

## Returns

[`Abi`](/docs/glossary/types#abi)

Parsed ABI parameter.

## Parameters

### signature

- **Type:** `string | string[]`

Human-Readable ABI parameter.

```ts
import { parseAbiParameter } from 'viem'

const abiParameter = parseAbiParameter([
  //  ^? const abiParameter: { type: "tuple"; components: [{ type: "string"; name:...
  'Baz bar',
  'struct Baz { string name; }',
])
```