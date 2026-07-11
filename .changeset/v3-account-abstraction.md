---
"viem": major
---

Moved account abstraction to namespaced v3 clients, actions, and smart accounts, with ox-backed primitives, ERC-7739 Solady signatures, and EntryPoint 0.9 `paymasterSignature` support.

```diff
-import { createBundlerClient, sendUserOperation, toSoladySmartAccount } from 'viem/account-abstraction'
+import { Actions, Client, SoladySmartAccount } from 'viem/account-abstraction'

-const account = await toSoladySmartAccount(options)
-const client = createBundlerClient({ account, transport })
-const hash = await sendUserOperation(client, request)
+const account = await SoladySmartAccount.from(options)
+const client = Client.create({ account, transport })
+const hash = await Actions.userOperation.send(client, request)
```
