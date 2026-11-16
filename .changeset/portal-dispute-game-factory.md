---
"viem": patch
---

Made `getGames` read the dispute game factory from the portal when the target chain does not define `disputeGameFactory`, which fixed `getWithdrawalStatus`, `waitToProve` and `getTimeToProve` throwing a `TypeError` on fault-proof OP Stack chains that only define `l2OutputOracle`.
