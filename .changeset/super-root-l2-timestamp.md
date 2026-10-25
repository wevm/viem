---
"viem": patch
---

Fixed `getWithdrawalStatus`, `getTimeToProve` and `waitToProve` matching super-root dispute games against the withdrawal's L2 block number when `l2Timestamp` was not passed: they now use the `blockTimestamp` of the receipt's logs, or throw `L2TimestampRequiredError` when it is missing.
