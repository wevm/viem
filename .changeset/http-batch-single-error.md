---
'viem': patch
---

Fixed `http` transport batches and `RpcClient.http` batch requests mishandling a server that rejected the whole batch with a single error or returned fewer responses than requests.
