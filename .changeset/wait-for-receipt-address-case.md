---
'viem': patch
---

Fixed `Actions.transaction.waitForReceipt` missing a replacement transaction, or reporting a repriced one as `replaced`, when the RPC returned addresses in a different case.
