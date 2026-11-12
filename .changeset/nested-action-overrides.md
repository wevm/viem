---
"viem": patch
---

Resolved the actions called by `deployContract`, `getDelegation`, `sendCalls`, and `signAuthorization` through `getAction`, so overrides of those actions on the client are used.
