---
"viem": patch
---

Made `Authorization.verify` return `false` for an EIP-7702 authorization with a `yParity` other than 0 or 1, which EIP-7702 treats as having no authority.
