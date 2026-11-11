---
"viem": patch
---

Updated `verifyHash`, `verifyMessage`, `verifyTypedData`, and `verifySiweMessage` to return `false` for signatures whose ECDSA recovery fails instead of matching the zero address.
