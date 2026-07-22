---
"viem": patch
---

Fixed `fromBlobs` dropping data (and skipping subsequent blobs) when a completely-full blob's final data byte was `0x80`, which was misread as the blob terminator.
