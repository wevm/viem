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

Local account definitions began requiring raw `sign` and deriving high-level signing methods; `source` was replaced by `keyType`.

```diff
 const local = Account.from({
   address,
-  source: 'custom',
-  signMessage,
-  signTransaction,
-  signTypedData,
+  keyType: 'custom',
+  sign,
 })

-account.source // 'privateKey' | 'hd' | 'custom'
+account.keyType // 'secp256k1' | 'custom'
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

Account parsing and private-key address derivation moved to the `Account`, `Address`, and `Secp256k1` namespaces.

```diff
-import { parseAccount, privateKeyToAddress } from 'viem/accounts'
+import { Account, Address, Secp256k1 } from 'viem'

-const account = parseAccount(source)
-const address = privateKeyToAddress(privateKey)
+const account = Account.from(source)
+const address = Address.fromPublicKey(Secp256k1.getPublicKey({ privateKey }), { checksum: true })
```

The global `setSignEntropy` helper was replaced by per-signature `extraEntropy` on `Secp256k1.sign`.

```diff
-setSignEntropy(true)
+Secp256k1.sign({ payload, privateKey, extraEntropy: true })
```

Flat account source and HD option types moved to the `Account.from` and constructor namespaces.

```diff
-import type { AccountSource, CustomSource, HDKeyToAccountErrorType, HDKeyToAccountOptions, HDOptions } from 'viem/accounts'
+import { Account, Address } from 'viem'

+type Source = Address.Address | Account.from.Account
+type Custom = Account.from.Account
+type Options = Account.fromHdKey.Options
+type Error = Account.fromHdKey.ErrorType
```

The named account types moved onto the `Account` namespace, with the `source` discriminant (`'privateKey' | 'hd' | 'custom'`) replaced by `keyType` (`'secp256k1' | 'custom'`), `ParseAccount` folded into `Account.from.ReturnType`, and the constructor option types moved onto their constructors.

```diff
- import type {
-   HDAccount,
-   JsonRpcAccount,
-   LocalAccount,
-   MnemonicToAccountOptions,
-   ParseAccount,
-   PrivateKeyAccount,
-   PrivateKeyToAccountOptions,
- } from 'viem'
+ import type { Account } from 'viem'

- type Hd = HDAccount
- type JsonRpc = JsonRpcAccount<address>
- type Local = LocalAccount<'custom', address>
- type PrivateKey = PrivateKeyAccount
- type Parsed = ParseAccount<accountOrAddress>
- type MnemonicOptions = MnemonicToAccountOptions
- type PrivateKeyOptions = PrivateKeyToAccountOptions
+ type Hd = Account.Hd
+ type JsonRpc = Account.JsonRpc<address>
+ type Local = Account.Local<'custom', address>
+ type PrivateKey = Account.PrivateKey
+ type Parsed = Account.from.ReturnType<accountOrAddress>
+ type MnemonicOptions = Account.fromMnemonic.Options
+ type PrivateKeyOptions = Account.fromPrivateKey.Options
```
