---
'viem': patch
---

Fixed `Actions.wallet.waitForCallsStatus` resolving concurrent waits for the same id with the first caller's polling, retry, and status options.
