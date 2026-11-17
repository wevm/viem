---
"viem": patch
---

Improved `ipc` transport performance by framing messages incrementally across data events instead of copying and rescanning the pending buffer.
