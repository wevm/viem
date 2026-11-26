---
"viem": patch
---

Reduced type-checking cost of Tempo `ExecutionError` types, Tempo `earn` deployment actions, actions that take a `Client`, and passing a chain where a `Chain` is expected, by declaring `Chain`'s variance and avoiding distributive `Omit` and quadratic error unions.
