---
"viem": patch
---

Added a `tokens` export to `viem/tokens` with curated token sets (`tokens.all`, `tokens.popular`, `tokens.tempo`) that can be passed to a Client's `tokens` property. `viem/tempo`'s `createClient` now defaults `tokens` to `tokens.tempo`.
