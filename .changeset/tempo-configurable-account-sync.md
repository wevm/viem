---
"viem": patch
---

`viem/tempo`: Synced configurable accounts with Tempo T14, renaming the `nativeMultisig` ABI, address and selector exports to `configurableAccount`, sending `configurableAccountSimulation` to the node, deriving configurable account addresses and signatures with the `tempo:configurable-account:*` domains, and storing relay state under `configurableAccount:*` store keys.

```diff
- Abis.nativeMultisig
+ Abis.configurableAccount
- Addresses.nativeMultisig
+ Addresses.configurableAccount
- Addresses.nativeMultisigFactory
+ Addresses.configurableAccountRecoveryFactory
- Selectors.nativeMultisig
+ Selectors.configurableAccount
```
