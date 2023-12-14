---
"viem": patch
---

Fixed an issue where Viem could extract the wrong ABI item if ambiguity is detected within overload ABI items. Now, if ambiguity is detected, an error will be thrown.
