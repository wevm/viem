---
"viem": patch
---

Fixed a split HTTP transport or multicall batch leaving its wait timer armed, which flushed the next batch under the same id before its wait elapsed.
