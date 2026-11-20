---
"viem": patch
---

Fixed `viem/op-stack` withdrawals on chains that move to a shared `DisputeGameFactory` in OP Stack Upgrade 22 (Lagoon) by reading the factory from the portal, treated `ZK_DISPUTE_GAME` (game type `10`) as a super-root game, and formatted the `opGasRefund` receipt field.
