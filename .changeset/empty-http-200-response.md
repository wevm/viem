---
"viem": patch
---

Fixed the HTTP transport resolving with `undefined` when the server replied to a request with an empty body, it now throws an `HttpRequestError` instead.
