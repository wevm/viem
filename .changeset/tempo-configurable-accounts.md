---
"viem": patch
---

`viem/tempo`: Renamed experimental native multisig APIs to configurable accounts ([TIP-1107](https://tips.sh/1107)).

```diff
-import { Account, MultisigConfig, MultisigOperation, Relay } from 'viem/tempo'
+import { Account, AccountConfig, AccountOperation, Relay } from 'viem/tempo'

-const account = Account.fromMultisig({ owners, threshold: 2 })
+const account = Account.fromConfig({ owners, threshold: 2 })
-account.source // 'multisig'
+account.source // 'configurable'

-const transport = withRelay(http(), { plugins: [Relay.multisig({ store })] })
+const transport = withRelay(http(), { plugins: [Relay.accounts({ store })] })
-client.transport.multisig // true
+client.transport.accounts // true

-const config = await client.multisig.getConfig({ address })
+const config = await client.accounts.getConfig({ address })

-receipt.multisig
+receipt.operation

-await client.request({ method: 'multisig_getConfig', params: [{ address }] })
+await client.request({ method: 'account_getConfig', params: [{ address }] })

-const request = { ...transaction, multisigSimulation }
+const request = { ...transaction, accountSimulation }
```
