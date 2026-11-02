---
"viem": patch
---

`viem/tempo`: Raised the default expiring nonce `validBefore` from 25 to 270 seconds, capped `Relay.feePayer` expiring nonce windows at 300 seconds, added `Expiry.expiringNonceMax`, and replaced the random expiring nonce `validAfter` with a random `nonce` discriminator.
