---
"viem": patch
---

Fixed `publicKeyToAddress` returning a wrong address for a compressed public key (or one without the `0x04` prefix). It now throws `InvalidPublicKeyError`.
