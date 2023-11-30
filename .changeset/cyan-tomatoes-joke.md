---
"viem": patch
---

Fixed an issue where if a CCIP-Read request returned with an undefined body, body.error would still attempt to be read causing an `Cannot read properties of undefined` error, instead of the status text.
