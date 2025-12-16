---
"viem": minor
---

Added first-class support and extension for [Tempo](https://docs.tempo.xyz).

---

Attaching a Tempo chain to your client grants your transaction actions with [Tempo superpowers](https://docs.tempo.xyz/protocol/transactions) like batched calls and external fee payer capabilities.

```ts
import { createClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { tempoTestnet } from 'viem/chains'

const client = createClient({
  account: privateKeyToAccount('0x…'),
  chain: tempoTestnet.extend({ feeToken: '0x20c00000000000000000000000000000000000fa' }),
  transport: http(),
})

const receipt = client.sendTransactionSync({
  calls: [
    { data: '0x…', to: '0x…' },
    { data: '0x…', to: '0x…' },
    { data: '0x…', to: '0x…' },
  ],
  feePayer: privateKeyToAccount('0x…'),
})
```

You can also use Tempo Actions to call to enshrined protocol features like the Stablecoin Token Factory:

```ts
import { createClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { tempoTestnet } from 'viem/chains'
import { tempoActions } from 'viem/tempo'

const client = createClient({
  account: privateKeyToAccount('0x…'),
  chain: tempoTestnet,
  transport: http(),
})
  .extend(tempoActions())

const { receipt, token } = await client.token.createSync({
  currency: 'USD',
  name: 'My Company USD',
  symbol: 'CUSD',
})
```