---
"viem": major
---

Byte hashing utilities moved from flat utilities to the `Hash` namespace.

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
