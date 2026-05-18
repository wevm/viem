---
name: viem-v3-migration
description: Reference landed Viem v3 APIs for consumers and agents. Use when checking the current v3 public surface or looking up v2 utility wrapper equivalents.
---

# Viem v3 Reference

Reference for the Viem v3 public surface that has already landed. This file is
for consumers and agents to look up canonical imports and wrapper equivalents.

Only landed modules are documented here.

## Utilities

Ox-backed utility modules are exposed from `viem/utils`.

```ts
import { Bytes, Hex, Value } from 'viem/utils'
import * as Hex from 'viem/utils/Hex'
```

```diff
- import { concatHex, formatEther } from 'viem'
+ import { Hex, Value } from 'viem/utils'

- concatHex(values)
+ Hex.concat(...values)

- formatEther(value)
+ Value.formatEther(value)
```

### `Hex`

| v2 | v3 |
| --- | --- |
| `boolToHex` | `Hex.fromBoolean` |
| `bytesToHex` | `Hex.fromBytes` |
| `concatHex` | `Hex.concat` |
| `hexToBigInt` | `Hex.toBigInt` |
| `hexToBool` | `Hex.toBoolean` |
| `hexToBytes` | `Hex.toBytes` or `Bytes.fromHex` |
| `hexToNumber` | `Hex.toNumber` |
| `hexToString` | `Hex.toString` |
| `isHex` | `Hex.validate` |
| `numberToHex` | `Hex.fromNumber` |
| `padHex` | `Hex.padLeft` or `Hex.padRight` |
| `sliceHex` | `Hex.slice` |
| `stringToHex` | `Hex.fromString` |
| `trimHex` | `Hex.trimLeft` or `Hex.trimRight` |

### `Bytes`

| v2 | v3 |
| --- | --- |
| `boolToBytes` | `Bytes.fromBoolean` |
| `bytesToBigint` | `Bytes.toBigInt` |
| `bytesToBool` | `Bytes.toBoolean` |
| `bytesToHex` | `Bytes.toHex` or `Hex.fromBytes` |
| `bytesToNumber` | `Bytes.toNumber` |
| `bytesToString` | `Bytes.toString` |
| `concatBytes` | `Bytes.concat` |
| `hexToBytes` | `Bytes.fromHex` |
| `isBytes` | `Bytes.validate` |
| `numberToBytes` | `Bytes.fromNumber` |
| `padBytes` | `Bytes.padLeft` or `Bytes.padRight` |
| `sliceBytes` | `Bytes.slice` |
| `stringToBytes` | `Bytes.fromString` |
| `trimBytes` | `Bytes.trimLeft` or `Bytes.trimRight` |

### `Value`

| v2 | v3 |
| --- | --- |
| `formatEther` | `Value.formatEther` |
| `formatGwei` | `Value.formatGwei` |
| `formatUnits` | `Value.format` |
| `parseEther` | `Value.fromEther` |
| `parseGwei` | `Value.fromGwei` |
| `parseUnits` | `Value.from` |
