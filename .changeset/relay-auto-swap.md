---
"viem": patch
---

`viem/tempo`: Added `Relay.autoSwap`, which recovers `InsufficientBalance` fills that opt in with `capabilities.autoSwap` by prepending a stablecoin DEX buy of the missing amount.
