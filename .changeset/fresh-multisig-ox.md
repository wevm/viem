---
'viem': patch
---

Updated Ox to `0.14.45` and migrated experimental multisig accounts to configurable recovery factories, complete config signatures, and commitment-based state.

```ts
const account = Account.fromMultisig(config, { factory })
const updated = Account.fromMultisig(nextConfig, { factory, address: account.address })
```
