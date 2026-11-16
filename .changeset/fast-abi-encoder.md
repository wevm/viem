---
"viem": patch
---

Sped up `encodeAbiParameters` and `encodeFunctionData` by parsing parameters once per call, building the hex output in one pass, and caching function selectors per ABI item.
