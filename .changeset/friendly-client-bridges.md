---
'viem': minor
---

Added `Client.fromV2` and `Client.toV2` to adapt base Clients between Viem v2 and v3.

```ts
import { publicActions as publicActionsV2 } from 'viem'
import { Client, http } from 'viem-v3'

const client = Client.create({ transport: http() })
const publicClientV2 = Client.toV2(client).extend(publicActionsV2)
```
