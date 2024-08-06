---
"viem": minor
---

Renamed "zkSync" to "ZKsync":
  - Context: "zkSync" was officially renamed to "ZKsync" a while ago.
  - Variable names: `zkSync` -> `zksync` (for simplicity and consistency between folder/file names and variables).
  - Types: `ZkSync` -> `Zksync`.
  - Old naming still remains in Viem, however is marked as `@deprecated` and will be removed in the next major release.

Removed deprecated `zkSyncTestnet` chain.