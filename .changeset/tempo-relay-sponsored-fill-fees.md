---
"viem": patch
---

`viem/tempo`: Fixed `Relay.feePayer` sponsorship of `eth_fillTransaction` requests that set fee fields without `gas` failing gas estimation when the sender cannot afford the fees.
