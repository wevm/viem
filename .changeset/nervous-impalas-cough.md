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
    'event Approval(address indexed owner, address indexed sender, uint256 value)',
    'event Transfer(address indexed from, address indexed to, uint256 value)',
  ])
})
```
