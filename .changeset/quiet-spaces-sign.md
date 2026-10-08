---
"viem": patch
---

Fixed `normalizeSignature` (and `toFunctionSelector`, `toEventSelector`, `toSignature`) dropping the first parameter when a space directly follows an opening parenthesis (e.g. `function foo( uint256 a )`).
