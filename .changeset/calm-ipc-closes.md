---
"viem": patch
---

Rejected pending IPC requests when the node closes the connection, and shared one IPC socket between requests and subscriptions when `reconnect` is set.
