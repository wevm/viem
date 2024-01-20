---
description: Parses human-readable ABI item (e.g. error, event, function) into ABI item.
---

# parseAbiItem

Parses human-readable ABI item (e.g. error, event, function) into ABI item. Re-exported from [ABIType](https://abitype.dev/api/human#parseabiitem-1).

## Import

```ts
import { parseAbiItem } from 'viem'
```

## Usage

```ts
import { parseAbiItem } from 'viem'

const abiItem = parseAbiItem(
  //  ^? const abiItem: { name: "balanceOf"; type: "function"; stateMutability: "view";...
  'function balanceOf(address owner) view returns (uint256)',
)
```

## Returns

[`Abi`](/docs/glossary/types#abi)

Parsed ABI item.

## Parameters

### signatures

- **Type:** `string[]`

Human-Readable ABI item.

```ts
import { parseAbiItem } from 'viem'

const abiItem = parseAbiItem([
  //  ^? const abiItem: { name: "foo"; type: "function"; stateMutability: "view"; inputs:...
  'function foo(Baz bar) view returns (string)',
  'struct Baz { string name; }',
])
```