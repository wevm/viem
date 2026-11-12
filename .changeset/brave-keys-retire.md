---
"viem": patch
---

Fixed the Tempo `verifyHash` hook accepting a signature of a root key that a config commitment retired, which made `verifyHash`, `verifyMessage`, and `verifySiweMessage` read the account's config commitment for a signature that recovers to the account, in every `mode`.
