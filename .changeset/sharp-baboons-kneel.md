---
"viem": patch
---

Fixed extreme edge-case where decoding a **malformed** payload against a nested array type could cause \`decodeAbiParameters\` to enter an infinite loop.
