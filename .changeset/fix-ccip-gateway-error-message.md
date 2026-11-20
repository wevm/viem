---
"viem": patch
---

Fixed `ccipRequest` to include the gateway's EIP-3668 error `message` in `HttpRequestError` details instead of only the HTTP status text.
