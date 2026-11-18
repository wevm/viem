---
"viem": patch
---

Fixed malformed JSON from the `ipc` transport escaping the socket data listener instead of rejecting pending requests.
