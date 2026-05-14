---
"viem": patch
---

`viem/tempo`: Encoded WebAuthn `keyData` as a 2-byte length hint instead of a raw blob, and auto-shimmed user-provided values longer than 4 bytes.
