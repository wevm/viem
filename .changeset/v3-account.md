---
"viem": major
---

Private key account construction was moved from `privateKeyToAccount` to `Account.fromPrivateKey`.

```diff
-import { privateKeyToAccount } from 'viem/accounts'
+import { Account } from 'viem'
 
-const account = privateKeyToAccount(privateKey)
+const account = Account.fromPrivateKey(privateKey)
```

Mnemonic account construction was moved from `mnemonicToAccount` to `Account.fromMnemonic`.

```diff
-import { mnemonicToAccount } from 'viem/accounts'
+import { Account } from 'viem'
 
-const account = mnemonicToAccount(mnemonic, { addressIndex: 1 })
+const account = Account.fromMnemonic(mnemonic, { addressIndex: 1 })
```

HD key account construction was moved from `hdKeyToAccount` to `Account.fromHdKey`.

```diff
-import { hdKeyToAccount } from 'viem/accounts'
+import { Account } from 'viem'
 
-const account = hdKeyToAccount(hdKey, { addressIndex: 1 })
+const account = Account.fromHdKey(hdKey, { addressIndex: 1 })
```

Generic account construction was moved from `toAccount` to `Account.from`.

```diff
-import { toAccount } from 'viem/accounts'
+import { Account } from 'viem'
 
-const account = toAccount(address)
+const account = Account.from(address)
```

Private key generation was moved from `generatePrivateKey` to `Secp256k1.randomPrivateKey`.

```diff
-import { generatePrivateKey } from 'viem/accounts'
+import { Secp256k1 } from 'viem'
 
-const privateKey = generatePrivateKey()
+const privateKey = Secp256k1.randomPrivateKey()
```

Mnemonic generation was moved from `generateMnemonic` to `Mnemonic.random`.

```diff
-import { generateMnemonic, english } from 'viem/accounts'
+import { Mnemonic } from 'viem'
 
-const mnemonic = generateMnemonic(english, 256)
+const mnemonic = Mnemonic.random(Mnemonic.english, { strength: 256 })
```
