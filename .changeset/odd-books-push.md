---
"viem": minor
---

Added support for `sendCalls`, `getCallsStatus`, and `waitForCallsStatus` for wallets that do not support EIP-5792 (falls back to `eth_sendTransaction`).
