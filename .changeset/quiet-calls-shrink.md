---
"viem": patch
---

Replaced runtime `parseAbi` calls in `call` with literal ABIs, removing the human-readable ABI parser from bundles that only read contracts.
