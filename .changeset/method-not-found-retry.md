---
"viem": patch
---

Stopped retrying JSON-RPC method-not-found (`-32601`) and method-not-supported (`-32004`) errors from non-2xx HTTP responses, since a retry gets the same refusal.
