---
"viem": patch
---

Fixed `toFunctionSelector` and `toSignatureHash` keeping the `error` keyword in string signatures like `error Foo(uint256)`, which produced the wrong selector.
