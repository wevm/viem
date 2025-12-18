---
"viem": patch
---

Fix `tempo` transaction request formatting when `calls[].value` is provided as an RPC quantity string (e.g. `"0x"`). Fixes [#4182](https://github.com/wevm/viem/issues/4182).

