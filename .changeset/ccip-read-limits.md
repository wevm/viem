---
'viem': patch
---

**ccip:** Applied the HTTP transport timeout (including its override) and 10 MiB response cap to CCIP-Read gateway requests, refused non-HTTP(S) gateway URLs (including `data:` URLs, which previously worked), and limited one lookup to 4 nested callbacks, 4 nested local batches, 256 gateway requests and 16 concurrent requests.
