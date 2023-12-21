---
description: Parses human-readable ABI into JSON.
title: parseAbi
head:
  - - meta
    - property: og:title
      content: parseAbi
  - - meta
    - property: og:description
      content: Parses human-readable ABI into JSON.
---

# parseAbi

Parses human-readable ABI into JSON [`Abi`](/docs/glossary/types.html#abi). Re-exported from [ABIType](https://abitype.dev/api/human.html#parseabi-1).

## Import

```ts
import { parseAbi } from 'viem'
```

## Usage

```ts
import { parseAbi } from 'viem'

const abi = parseAbi([
  //  ^? const abi: readonly [{ name: "balanceOf"; type: "function"; stateMutability:...
  'function balanceOf(address owner) view returns (uint256)',
  'event Transfer(address indexed from, address indexed to, uint256 amount)',
])
```

## Returns

[`Abi`](/docs/glossary/types#abi)

The JSON ABI.

## Parameters

### signatures

- **Type:** `string[]`

Human-readable ABI.

```ts
import { parseAbi } from 'viem'

const abi = parseAbi([
  //  ^? const abi: readonly [{ name: "balanceOf"; type: "function"; stateMutability:...
  'function balanceOf(address owner) view returns (uint256)',
  'event Transfer(address indexed from, address indexed to, uint256 amount)',
])
```