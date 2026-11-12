---
"viem": patch
---

Fixed `Relay.create(...).fetch` never answering 413 for a body over 16 MiB when the request had an unread clone.
