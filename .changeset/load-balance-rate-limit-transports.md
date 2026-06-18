---
"viem": minor
---

Added `Transport.loadBalance` (round-robins requests across transports) and `Transport.rateLimit` (throttles a transport to a fixed requests-per-second budget), each also exported as a top-level `loadBalance` / `rateLimit` alias.
