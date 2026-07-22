---
"viem": patch
---

Fixed `fromBlobs` misreading a `0x80` data byte at a blob boundary as the terminator.
