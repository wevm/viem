---
"viem": patch
---

Added ZK signature owner approvals to `viem/tempo` multisig accounts ([TIP-1131](https://tips.sh/1131)): `Account.fromZk` accepts an `accessKey` option that lets the account `sign` ZK signatures, `Account.fromMultisig` accepts ZK accounts as owners, and ZK approvals are accepted in multisig `signatures`.
