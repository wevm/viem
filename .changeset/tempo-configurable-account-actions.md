---
"viem": patch
---

`viem/tempo`: Added `Actions.accounts.deriveAccount`, `Actions.accounts.upgrade`, `Actions.accounts.upgradeSync`, and `Actions.accounts.verifyHash` for Tempo T14 configurable accounts, added the `upgrade` form of `Account.fromConfig` for accounts upgraded in place, cached configs installed by account upgrades in `Relay.accounts`, and renamed the `nativeMultisig` ABI, address, and selector exports to `configurableAccount`.
