---
"viem": patch
---

Fixed `publicKeyToAddress` silently returning a wrong address for public keys that are not uncompressed (65 bytes with a `0x04` prefix), such as compressed keys; it now throws `InvalidPublicKeyError`.
