---
"viem": patch
---

Fixed `parseTransaction` to accept an EIP-7702 authorization `yParity` from 2 to 255 so a serialized transaction parses back, and made `recoverAuthorizationAddress` throw `InvalidYParityError` (and `verifyAuthorization` return `false`) for a `yParity` other than 0 or 1, which EIP-7702 treats as having no authority.
