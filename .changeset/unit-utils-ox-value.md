---
"viem": patch
---

Fixed `parseUnits` mis-rounding long fractional tails by delegating the unit utilities (`parseUnits`, `formatUnits`, `parseEther`, `parseGwei`, `formatEther`, `formatGwei`) to Ox's `Value` module, which rounds exactly in decimal space instead of via `Math.round(Number(...))`.
