---
"viem": patch
---

Fixed `getGames` and the OP Stack actions built on it (`getWithdrawalStatus`, `waitToProve`, `getTimeToProve`, `getGame`, `getL2Output`) throwing a `TypeError` on fault-proof chains that do not define `disputeGameFactory`, by reading the factory address from the portal instead.
