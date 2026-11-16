---
"viem": patch
---

Sped up `decodeAbiParameters` by parsing parameters once per call, reading offsets, lengths and integers straight from the data, and tracking re-reads with a bitset.
