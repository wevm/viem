---
"viem": patch
---

fix(utils): retry on JSON-RPC 429 error code in batch requests

Batch requests return HTTP 200 with JSON-RPC error code 429 when rate limited.
Added error.code === 429 to shouldRetry to handle batched rate-limit responses.

Fixes wevm/viem#3680
