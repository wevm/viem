---
"viem": patch
---

Fixed Tempo Earn `deposit`, `depositShares`, `redeem`, and `withdrawExact` to throw `AccountNotFoundError` when `account` is `null` and no `recipient` is given, instead of defaulting the recipient to the client account.
