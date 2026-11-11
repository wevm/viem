---
"viem": patch
---

Updated `verifyHash`, `verifyMessage`, `verifyTypedData`, and `verifySiweMessage` to return `false` for the zero address and for signatures whose ECDSA recovery fails instead of matching the zero address.
