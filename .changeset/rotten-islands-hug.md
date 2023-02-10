---
"viem": patch
---

**Breaking:** Removed all public/wallet/test actions & utils from the `viem` entrypoint to their respective entrypoints:

- `viem` = Clients & Transport exports
- `viem/chains` = Chains exports
- `viem/contract` = Contract Actions & Utils exports
- `viem/ens` = ENS Actions & Utils exports
- `viem/public` = Public Actions exports
- `viem/test` = Test Actions exports
- `viem/utils` = Utils exports
- `viem/wallet` = Wallet Actions exports