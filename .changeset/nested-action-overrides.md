---
"viem": patch
---

Resolved the actions called by `Actions.address.getDelegation` and `Actions.wallet.signAuthorization` through `Actions.getAction`, so overrides of those actions on the Client are used.
