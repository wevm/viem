---
"viem": major
---

Byte hashing utilities moved from flat utilities to the `Hash` namespace, and their return types moved onto the function namespaces (with `'Hex' | 'Bytes'` type parameter casing).

```diff
- import { isHash, keccak256, ripemd160, sha256 } from 'viem'
+ import { Hash } from 'viem'

- const digest = keccak256('0xdeadbeef')
- const sha = sha256('0xdeadbeef')
- const ripe = ripemd160('0xdeadbeef')
- const valid = isHash(digest)
+ const digest = Hash.keccak256('0xdeadbeef')
+ const sha = Hash.sha256('0xdeadbeef')
+ const ripe = Hash.ripemd160('0xdeadbeef')
+ const valid = Hash.validate(digest)

- type Digest = Keccak256Hash<'hex'>
- type Sha = Sha256Hash<'hex'>
- type Ripe = Ripemd160Hash<'hex'>
+ type Digest = Hash.keccak256.ReturnType<'Hex'>
+ type Sha = Hash.sha256.ReturnType<'Hex'>
+ type Ripe = Hash.ripemd160.ReturnType<'Hex'>
```

ABI selector and signature hash utilities moved from flat utilities to the ABI item namespaces.

```diff
- import { toEventHash, toEventSelector, toFunctionHash, toFunctionSelector } from 'viem'
+ import { AbiEvent, AbiFunction, AbiItem } from 'viem'

- const eventSelector = toEventSelector('event Transfer(address indexed from, address indexed to, uint256 value)')
- const eventHash = toEventHash('event Transfer(address indexed from, address indexed to, uint256 value)')
- const functionSelector = toFunctionSelector('function balanceOf(address)')
- const functionHash = toFunctionHash('function balanceOf(address)')
+ const eventSelector = AbiEvent.getSelector('event Transfer(address indexed from, address indexed to, uint256 value)')
+ const eventHash = AbiItem.getSignatureHash('event Transfer(address indexed from, address indexed to, uint256 value)')
+ const functionSelector = AbiFunction.getSelector('function balanceOf(address)')
+ const functionHash = AbiItem.getSignatureHash('function balanceOf(address)')
```

`toEventSignature` and `toFunctionSignature` moved to `AbiItem.getSignature`, and their deprecated `getEventSignature`/`getFunctionSignature` aliases were removed (as were the deprecated `getEventSelector`/`getFunctionSelector` aliases of the selector utilities).

```diff
- import { toEventSignature, toFunctionSignature } from 'viem'
+ import { AbiItem } from 'viem'

- const eventSignature = toEventSignature('event Transfer(address indexed from, address indexed to, uint256 value)')
- const functionSignature = toFunctionSignature('function balanceOf(address)')
+ const eventSignature = AbiItem.getSignature('event Transfer(address indexed from, address indexed to, uint256 value)')
+ const functionSignature = AbiItem.getSignature('function balanceOf(address)')
```

The zero hash constant moved to `Hash.zero`.

```diff
- import { zeroHash } from 'viem'
+ import { Hash } from 'viem'

- const hash = zeroHash
+ const hash = Hash.zero
```
