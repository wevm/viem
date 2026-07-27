---
"viem": patch
---

Fixed `estimateFeesPerGas` (and `fillTransaction`) rounding the base fee multiplier up via `Math.ceil`, which overshot the intended value for multipliers such as `1.09` (applied as `1.1`) due to floating-point error. The multiplier is now recovered with `Math.round`.
