---
description: Parses human-readable ABI parameters into ABI parameters.
---

# parseAbiParameters

Parses human-readable ABI parameters into [`AbiParameter`s](/docs/glossary/types#abiparameter). Re-exported from [ABIType](https://abitype.dev/api/human#parseabiparameters-1).

## Import

```ts
import { parseAbiParameters } from 'viem'
```

## Usage

```ts
import { parseAbiParameters } from 'viem'

const abiParameters = parseAbiParameters(
  //  ^? const abiParameters: [{ type: "address"; name: "from"; }, { type: "address";...
  'address from, address to, uint256 amount',
)
```

## Returns

[`Abi`](/docs/glossary/types#abi)

Parsed ABI parameters.

## Parameters

### params

- **Type:** `string | string[]`

Human-Readable ABI parameters.

```ts
import { parseAbiParameters } from 'viem'

const abiParameters = parseAbiParameters([
  //  ^? const abiParameters: [{ type: "tuple"; components: [{ type: "string"; name:...
  'Baz bar',
  'struct Baz { string name; }',
])
```