---
"viem": major
---

Signature serialization, parsing, recovery, and compact conversion utilities moved from flat exports to the `Signature` and `Secp256k1` namespaces.

```diff
-import { parseSignature, recoverAddress, recoverPublicKey, serializeSignature, signatureToCompactSignature } from 'viem'
+import { Secp256k1, Signature } from 'viem'
 
-const signature = parseSignature(hex)
-const hex = serializeSignature(signature)
-const compact = signatureToCompactSignature(signature)
-const address = await recoverAddress({ hash, signature })
-const publicKey = recoverPublicKey({ hash, signature })
+const signature = Signature.fromHex(hex)
+const hex = Signature.toHex(signature)
+const compact = Signature.toCompactBytes(signature)
+const address = Secp256k1.recoverAddress({ payload: hash, signature })
+const publicKey = Secp256k1.recoverPublicKey({ payload: hash, signature })
```

Low-level secp256k1 signing, verification, and public-key address derivation moved from account and signature helpers to the `Secp256k1` and `Address` namespaces.

```diff
-import { verifyHash } from 'viem'
-import { publicKeyToAddress, sign } from 'viem/accounts'
+import { Address, Secp256k1 } from 'viem'
 
-const signature = sign({ hash, privateKey })
-const valid = await verifyHash({ hash, publicKey, signature })
-const address = publicKeyToAddress(publicKey)
+const signature = Secp256k1.sign({ payload: hash, privateKey })
+const valid = Secp256k1.verify({ payload: hash, publicKey, signature })
+const address = Address.fromPublicKey(publicKey)
```

ERC-6492 and ERC-8010 signature wrapping helpers moved from flat exports to the `SignatureErc6492` and `SignatureErc8010` namespaces.

```diff
-import { parseErc6492Signature, parseErc8010Signature, serializeErc6492Signature, serializeErc8010Signature } from 'viem'
+import { SignatureErc6492, SignatureErc8010 } from 'viem'
 
-const erc6492 = parseErc6492Signature(wrapped)
-const wrapped6492 = serializeErc6492Signature(erc6492)
-const erc8010 = parseErc8010Signature(wrapped)
-const wrapped8010 = serializeErc8010Signature(erc8010)
+const erc6492 = SignatureErc6492.unwrap(wrapped)
+const wrapped6492 = SignatureErc6492.wrap(erc6492)
+const erc8010 = SignatureErc8010.unwrap(wrapped)
+const wrapped8010 = SignatureErc8010.wrap(erc8010)
```

HD key, mnemonic seed, and wordlist utilities moved from account exports to the `HdKey` and `Mnemonic` namespaces.

```diff
-import { HDKey, english, generateMnemonic, hdKeyToAccount } from 'viem/accounts'
+import { HdKey, Mnemonic } from 'viem'
 
-const mnemonic = generateMnemonic(english)
-const account = hdKeyToAccount(HDKey.fromMasterSeed(seed))
+const mnemonic = Mnemonic.random(Mnemonic.english)
+const seed = Mnemonic.toSeed(mnemonic)
+const hdKey = HdKey.fromSeed(seed)
```
