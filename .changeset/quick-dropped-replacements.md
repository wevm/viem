---
"viem": patch
---

Added a `replacement` option to `Actions.transaction.waitForReceipt` that looks up a dropped transaction by sender and nonce to detect its replacement, and made the wait call `onReplaced` for a replacement found while it waits for more confirmations.
