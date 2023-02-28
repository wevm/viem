---
"viem": patch
---

**Breaking:** The `from` argument has been removed from Actions in favour of `account` to distinguish between [Account types](https://viem.sh/docs/clients/wallet):

```diff
+ import { getAccount } from 'viem'

const [address] = await walletClient.requestAddresses()
+ const account = getAccount(address)

const hash = await walletClient.sendTransaction({
- from: address,
+ account,
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: 1000000000000000000n
})
```

Affected actions:

- `call`
- `estimateGas`
- `sendTransaction`
- `signMessage`
- `estimateContractGas`
- `multicall`
- `readContract`
- `simulateContract`
- `writeContract` 