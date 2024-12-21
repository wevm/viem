---
"viem": patch
---

Fixed an issue that caused the nonce to increment prematurely in prepareTransactionRequest, resulting in possible nonce gaps. Now the nonce manager logic is arranged so that gas estimation is performed first, ensuring no wasted nonce if gas estimation fails
