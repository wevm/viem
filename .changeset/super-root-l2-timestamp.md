---
"viem": patch
---

Fixed OP Stack `Actions.l1.getWithdrawalStatus`, `Actions.l1.getTimeToProve`, and `Actions.l1.waitToProve` matching super-root games against the L2 block number instead of the withdrawal's L2 timestamp, which they now read from the receipt logs' `blockTimestamp` (or throw `Withdrawal.L2TimestampRequiredError`).
