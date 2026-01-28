---
"viem": major
---

**Breaking:** Renamed `nonceKey: 'random'` to `nonceKey: 'expiring'` to align with [TIP-1009](https://docs.tempo.xyz/protocol/tips/tip-1009) terminology.

TIP-1009 defines "expiring nonces" as time-based replay protection using `validBefore` timestamps. The name `'expiring'` better describes the mechanism than `'random'`.

```diff
await sendTransaction(client, {
  account,
- nonceKey: 'random',
+ nonceKey: 'expiring',
  to: '0x...',
})
```
