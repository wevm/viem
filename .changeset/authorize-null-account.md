---
"viem": patch
---

Fixed `accessKey.authorize` and `accessKey.authorizeSync` falling back to the client account when `account` was `null`; they now throw `account is required.` instead.
