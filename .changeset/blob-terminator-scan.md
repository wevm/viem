---
"viem": patch
---

Improved `fromBlobs` performance by locating the terminator once instead of rescanning the remaining blob at every `0x80` byte.
