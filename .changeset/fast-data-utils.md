---
"viem": patch
---

Sped up `padBytes`, `padHex`, `concatHex`, `trim`, `sliceHex` and `size` by copying bytes with `Uint8Array.set`, comparing characters by char code and stripping the `0x` prefix with `slice`.
