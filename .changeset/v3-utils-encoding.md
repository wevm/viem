---
"viem": major
---

Hex conversion utilities moved from flat utilities to the `Hex` namespace.

```diff
- import { hexToBigInt, hexToBytes, hexToNumber, hexToString, numberToHex, stringToHex, toHex } from 'viem'
+ import { Hex } from 'viem'

- const hex = toHex(420n)
- const numberHex = numberToHex(420)
- const stringHex = stringToHex('hello')
- const value = hexToBigInt(hex)
- const number = hexToNumber(numberHex)
- const text = hexToString(stringHex)
- const bytes = hexToBytes(hex)
+ const hex = Hex.fromNumber(420n)
+ const numberHex = Hex.fromNumber(420)
+ const stringHex = Hex.fromString('hello')
+ const value = Hex.toBigInt(hex)
+ const number = Hex.toNumber(numberHex)
+ const text = Hex.toString(stringHex)
+ const bytes = Hex.toBytes(hex)
```

Bytes conversion utilities moved from flat utilities to the `Bytes` namespace.

```diff
- import { bytesToHex, fromBytes, toBytes } from 'viem'
+ import { Bytes } from 'viem'

- const bytes = toBytes('hello')
- const hex = bytesToHex(bytes)
- const text = fromBytes(bytes, 'string')
+ const bytes = Bytes.fromString('hello')
+ const hex = Bytes.toHex(bytes)
+ const text = Bytes.toString(bytes)
```

RLP utilities moved from flat utilities to the `Rlp` namespace.

```diff
- import { fromRlp, toRlp } from 'viem'
+ import { Rlp } from 'viem'

- const encoded = toRlp(['0x01', '0x02'])
- const decoded = fromRlp(encoded)
+ const encoded = Rlp.fromHex(['0x01', '0x02'])
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

JSON stringification moved from the flat `stringify` utility to `Json.stringify`.

```diff
- import { stringify } from 'viem'
+ import { Json } from 'viem'

- const json = stringify({ value: 1n })
+ const json = Json.stringify({ value: 1n })
```
