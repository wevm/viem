---
"viem": patch
---

Changed `verifyHash` with `mode: 'allowAccessKey'` to verify configurable access keys and to reject retired root keys and inner signatures that do not match the stored key type.
