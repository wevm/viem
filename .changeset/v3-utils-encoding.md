---
"viem": major
---

Hex conversion utilities moved from flat utilities to the `Hex` namespace.

```diff
- import { boolToHex, hexToBigInt, hexToBool, hexToBytes, hexToNumber, hexToString, numberToHex, stringToHex, toHex } from 'viem'
+ import { Hex } from 'viem'

- const hex = toHex(420n)
- const numberHex = numberToHex(420)
- const stringHex = stringToHex('hello')
- const boolHex = boolToHex(true)
- const value = hexToBigInt(hex)
- const number = hexToNumber(numberHex)
- const text = hexToString(stringHex)
- const bytes = hexToBytes(hex)
- const bool = hexToBool(boolHex)
+ const hex = Hex.fromNumber(420n)
+ const numberHex = Hex.fromNumber(420)
+ const stringHex = Hex.fromString('hello')
+ const boolHex = Hex.fromBoolean(true)
+ const value = Hex.toBigInt(hex)
+ const number = Hex.toNumber(numberHex)
+ const text = Hex.toString(stringHex)
+ const bytes = Hex.toBytes(hex)
+ const bool = Hex.toBoolean(boolHex)
```

Bytes conversion utilities moved from flat utilities to the `Bytes` namespace, including the typed `bytesTo*`/`*ToBytes` variants (the redundant `bytesToBigint` alias was removed with them). The `ByteArray` type moved to `Bytes.Bytes`.

```diff
- import { boolToBytes, bytesToBigInt, bytesToBool, bytesToHex, bytesToNumber, bytesToString, fromBytes, numberToBytes, stringToBytes, toBytes, type ByteArray } from 'viem'
+ import { Bytes } from 'viem'

- const bytes = toBytes('hello')
- const stringBytes = stringToBytes('hello')
- const numberBytes = numberToBytes(420)
- const boolBytes = boolToBytes(true)
- const hex = bytesToHex(bytes)
- const text = fromBytes(bytes, 'string')
- const value = bytesToBigInt(bytes)
- const number = bytesToNumber(numberBytes)
- const bool = bytesToBool(boolBytes)
- const text2 = bytesToString(bytes)
+ const bytes = Bytes.fromString('hello')
+ const stringBytes = Bytes.fromString('hello')
+ const numberBytes = Bytes.fromNumber(420)
+ const boolBytes = Bytes.fromBoolean(true)
+ const hex = Bytes.toHex(bytes)
+ const text = Bytes.toString(bytes)
+ const value = Bytes.toBigInt(bytes)
+ const number = Bytes.toNumber(numberBytes)
+ const bool = Bytes.toBoolean(boolBytes)
+ const text2 = Bytes.toString(bytes)

- type Data = ByteArray
+ type Data = Bytes.Bytes
```

Conversion option types moved onto the owning function namespaces (e.g. `NumberToHexOpts` → `Hex.fromNumber.Options`, `BytesToBigIntOpts` → `Bytes.toBigInt.Options`, `HexToBytesOpts` → `Hex.toBytes.Options`), replacing the flat `*Opts` exports.

Data padding, slicing, concatenation, and validation utilities moved to the `Hex` and `Bytes` namespaces. `pad*` splits into `padLeft`/`padRight` with a positional size, `concat*` takes variadic arguments, and `Hex.validate` defaults `strict` to `false` (v2 `isHex` defaulted to strict validation — pass `{ strict: true }` to match).

```diff
- import { concat, concatBytes, concatHex, isBytes, isHex, pad, padBytes, padHex, slice, sliceBytes, sliceHex } from 'viem'
+ import { Bytes, Hex } from 'viem'

- const padded = padHex('0x1', { size: 32 })
- const paddedRight = padHex('0x1', { dir: 'right', size: 32 })
- const joined = concatHex(['0xdead', '0xbeef'])
- const sliced = sliceHex('0xdeadbeef', 0, 2)
- const validHex = isHex('0xdeadbeef')
+ const padded = Hex.padLeft('0x1', 32)
+ const paddedRight = Hex.padRight('0x1', 32)
+ const joined = Hex.concat('0xdead', '0xbeef')
+ const sliced = Hex.slice('0xdeadbeef', 0, 2)
+ const validHex = Hex.validate('0xdeadbeef', { strict: true })

- const paddedBytes = padBytes(bytes, { size: 32 })
- const joinedBytes = concatBytes([a, b])
- const slicedBytes = sliceBytes(bytes, 0, 2)
- const validBytes = isBytes(bytes)
+ const paddedBytes = Bytes.padLeft(bytes, 32)
+ const joinedBytes = Bytes.concat(a, b)
+ const slicedBytes = Bytes.slice(bytes, 0, 2)
+ const validBytes = Bytes.validate(bytes)
```

RLP utilities moved from flat utilities to the `Rlp` namespace.

```diff
- import { bytesToRlp, fromRlp, hexToRlp, toRlp } from 'viem'
+ import { Rlp } from 'viem'

- const encoded = toRlp(['0x01', '0x02'])
- const encodedFromBytes = bytesToRlp(bytes)
- const encodedFromHex = hexToRlp('0x01')
- const decoded = fromRlp(encoded)
+ const encoded = Rlp.fromHex(['0x01', '0x02'])
+ const encodedFromBytes = Rlp.fromBytes(bytes)
+ const encodedFromHex = Rlp.fromHex('0x01')
+ const decoded = Rlp.toHex(encoded)
```

Unit parsing and formatting utilities moved from flat utilities to the `Value` namespace.

```diff
- import { formatEther, formatGwei, formatUnits, parseEther, parseGwei, parseUnits } from 'viem'
+ import { Value } from 'viem'

- const wei = parseEther('1')
- const gwei = parseGwei('1')
- const units = parseUnits('1', 6)
- const ether = formatEther(wei)
- const gas = formatGwei(gwei)
- const formatted = formatUnits(units, 6)
+ const wei = Value.fromEther('1')
+ const gwei = Value.fromGwei('1')
+ const units = Value.from('1', 6)
+ const ether = Value.formatEther(wei)
+ const gas = Value.formatGwei(gwei)
+ const formatted = Value.format(units, 6)
```

Unit exponent maps were consolidated into `Value.exponents`.

```diff
- import { etherUnits, gweiUnits, weiUnits } from 'viem'
+ import { Value } from 'viem'

- const decimals = etherUnits.wei
+ const decimals = Value.exponents.ether
```

JSON stringification moved from the flat `stringify` utility to `Json.stringify`.

```diff
- import { stringify } from 'viem'
+ import { Json } from 'viem'

- const json = stringify({ value: 1n })
+ const json = Json.stringify({ value: 1n })
```
