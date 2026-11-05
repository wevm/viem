---
"viem": patch
---

Added `requestOptions.signal` to `waitForTransactionReceipt` to stop receipt polling, abort scoped requests, and cancel retry delays when the caller aborts.
