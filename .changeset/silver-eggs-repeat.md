---
"viem": minor
---

Added ability for consumer (libraries built on top of Viem) to globally configure properties on `BaseError`.

```ts
import { setErrorConfig } from 'viem'

setErrorConfig({
  getDocsUrl({ name }) {
    return `https://examplelib.com?error=${name}`
  }
  version: 'examplelib@1.2.3'
}) 
```