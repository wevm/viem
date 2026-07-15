---
'viem': patch
---

Fixed `decodeAbiParameters` silently corrupting `string` values whose UTF-8 payload begins with one or more NUL (`0x00`) bytes. The dynamic `string` decoder was left-trimming the payload, dropping leading zero bytes; since the ABI length prefix is authoritative, the payload is now decoded as-is. This also makes `string` decoding consistent with `bytes`.
