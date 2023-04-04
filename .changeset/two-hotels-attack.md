---
"viem": patch
---

Fixed ENS address resolution for when resolver returns with a null address, or resolvers that do not support `addr`. `getEnsAddress` returns `null` for these cases.
