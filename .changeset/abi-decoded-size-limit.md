---
"viem": patch
---

Limited the total size of `bytes` and `string` values that `decodeAbiParameters` decodes to 32 times the input size, throwing `AbiDecodingSizeLimitExceededError` beyond it.
