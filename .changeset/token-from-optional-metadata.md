---
'viem': patch
---

Fixed `Token.from` results omitting optional metadata being rejected by `Client.create({ tokens })` in consumer tsconfigs without `exactOptionalPropertyTypes`.
