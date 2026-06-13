---
"viem": patch
---

fix(parseUnits): round on digit chars instead of a JS float. `Number(".4999999999999999999")` evaluated to `0.5`, so the previous `Math.round(Number(...))` rounded values strictly below the midpoint up by a whole unit (e.g. `parseUnits("3.4999999999999999999", 0)` returned `4n` instead of `3n`).
