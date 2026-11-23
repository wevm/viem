---
"viem": patch
---

Fixed `serializeErc8010Signature` throwing for authorizations that have a `v` but no `yParity`.
