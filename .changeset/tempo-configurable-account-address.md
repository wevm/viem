---
"viem": patch
---

`viem/tempo`: Synced configurable accounts with tempoxyz/tempo#8595: account addresses now derive from the initial config hash without a recovery factory, so `Account.fromConfig` no longer takes a `factory` option and `Addresses.configurableAccountRecoveryFactory` was removed. Every derived configurable account address changes.
