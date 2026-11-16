---
"viem": patch
---

Fixed `getWithdrawalStatus`, `waitToProve` and `getTimeToProve` throwing a `TypeError` on fault-proof OP Stack chains that do not define `disputeGameFactory`, by reading the factory address from the portal instead.
