---
"viem": patch
---

Added a `reuse: { refreshBefore }` option to `Actions.zone.signAuthorizationToken` that returns the stored token until it nears expiry.
