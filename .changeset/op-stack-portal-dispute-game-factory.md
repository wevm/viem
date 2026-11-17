---
"viem": patch
---

Fixed OP Stack `Actions.l1.getGames` and the actions built on it (`getGame`, `getL2Output`, `getWithdrawalStatus`, `waitToProve`, `getTimeToProve`) throwing on target chains without a `disputeGameFactory` contract, by reading the factory address from the portal instead.
