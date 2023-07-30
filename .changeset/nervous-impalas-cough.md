---
"viem": minor
---

Added support for multiple `events` on Filters/Log Actions:

- `createEventFilter`
- `getLogs`
- `watchEvent`

Example:

```ts
import { parseAbi } from 'viem'
import { publicClient } from './client'

const logs = publicClient.getLogs({
  events: parseAbi([
    'event Approval(address sender, address owner, uint256 value)',
    'event Transfer(address from, address to, uint256 value)',
  ])
})
```
