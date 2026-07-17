---
"viem": patch
---

Flattened `Chain.rpcUrls` and `Chain.blockExplorers`; `rpcUrls.http` and `rpcUrls.ws` accept a single URL or a list.

```diff
const chain = Chain.from({
  id: 1,
- rpcUrls: { default: { http: ['https://eth.merkle.io'], webSocket: ['wss://eth.merkle.io'] } },
+ rpcUrls: { http: 'https://eth.merkle.io', ws: 'wss://eth.merkle.io' },
- blockExplorers: { default: { name: 'Etherscan', url: 'https://etherscan.io' } },
+ blockExplorers: { name: 'Etherscan', url: 'https://etherscan.io' },
})
```
