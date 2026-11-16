---
"viem": patch
---

Sped up `bytesToHex` by using the native `Uint8Array.prototype.toHex` when the runtime has it, and `stringToHex` and `stringToBytes` by skipping `TextEncoder` for ASCII strings of up to 64 characters.
