---
"viem": patch
---

Fixed `TS2742` when a consumer exports an inferred Bundler Client, by making `ox`'s internal `OneOf` and `KeyofUnion` nameable through `viem/_types/*`.
