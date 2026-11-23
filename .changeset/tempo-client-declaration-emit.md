---
"viem": patch
---

Fixed declaration emit for exported Tempo clients, which failed with TS7056 because the `Client` type was flattened into one anonymous object type.
