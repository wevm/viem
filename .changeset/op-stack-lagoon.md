---
"viem": patch
---

Fixed the `viem/op-stack` dispute game actions for OP Stack Upgrade 22 (Lagoon): read the `DisputeGameFactory` from the portal instead of the chain definition, so withdrawals keep working after chains move to a shared factory; treat `ZK_DISPUTE_GAME` (game type `10`) as a super-root game; and format the `opGasRefund` receipt field as a `bigint`.
