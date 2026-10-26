---
"viem": patch
---

Fixed importing `viem`, `viem/actions`, `viem/chains`, and other entrypoints under SES `lockdown()`, which threw `Cannot assign to read only property 'call'`.
