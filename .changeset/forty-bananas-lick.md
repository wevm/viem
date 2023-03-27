---
"viem": patch
---

Added Local Account implementations:

- `privateKeyToAccount`
- `mnemonicToAccount`
- `hdKeyToAccount`

If you were previously relying on the `viem/ethers` wallet adapter, you no longer need to use this.

```diff
- import { Wallet } from 'ethers'
- import { getAccount } from 'viem/ethers'
+ import { privateKeyToAccount } from 'viem/accounts'

const privateKey = '0x...'
- const account = getAccount(new Wallet(privateKey))
+ const account = privateKeyToAccount(privateKey)

const client = createWalletClient({
  account,
  chain: mainnet,
  transport: http()
})
```