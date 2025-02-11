---
"viem": patch
---

Fixed issue where `fallback` transports would fall through when other transports do not support the JSON-RPC method (has set up a method allowlist on the transport).
