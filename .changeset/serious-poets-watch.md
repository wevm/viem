---
"viem": patch
---

Fix Tempo `verifyHash` so authorized access-key signatures verify correctly by checking keychain metadata on-chain before verifying the inner signature. This also makes `verifyTypedData` work for Tempo access keys, which unblocks zero-dollar proof credential verification flows built on typed data.
