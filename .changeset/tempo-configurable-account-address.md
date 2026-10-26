---
"viem": patch
---

`viem/tempo`: Derived configurable account addresses from the initial config hash instead of a recovery factory (tempoxyz/tempo#8595), so `Account.fromConfig` no longer takes a `factory` option and `Addresses.configurableAccountRecoveryFactory` was removed.
