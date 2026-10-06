---
"viem": major
---

Removed the plaintext `zone.deposit`/`zone.depositSync` exports while preserving `zone.encryptedDeposit`, `zone.encryptedDepositSync`, and their preparation helpers, validated deposit memo lengths and prepared senders, fixed Moderato authorization scope and current-chain portal address derivation, exposed access and gateway enforcement metadata without the removed deposit-status RPC fallback, and corrected deposit outcome queue-hash correlation against `tempoxyz/zones@7c4fc9aed89759bc4123cfc230d7aff368eaa446`.

```diff
- await client.zone.deposit(parameters)
+ await client.zone.encryptedDeposit(parameters)
- await client.zone.depositSync(parameters)
+ await client.zone.encryptedDepositSync(parameters)
- const calls = client.zone.deposit.calls(args)
+ const prepared = await client.zone.encryptedDeposit.prepare({
+   ...args,
+   sender: client.account.address,
+ })
+ const calls = client.zone.encryptedDeposit.calls(prepared)
```
