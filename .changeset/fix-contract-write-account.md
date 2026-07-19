---
'viem': patch
---

Fixed `Contract.from` write methods throwing `TypeError` instead of a typed account error on clients without a hoisted account.
