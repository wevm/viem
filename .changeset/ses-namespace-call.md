---
"viem": patch
---

Fixed importing `viem`, `viem/chains`, `viem/tempo`, and other entrypoints under SES `lockdown()`, which threw `Cannot assign to read only property 'call'`.
