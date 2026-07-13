---
"viem": major
---

Signature serialization, parsing, and recovery utilities moved from flat exports to the `Signature` and `Secp256k1` namespaces. The deprecated `signatureToHex` and `hexToSignature` aliases were removed with them.

```diff
-import { parseSignature, recoverAddress, recoverPublicKey, serializeSignature } from 'viem'
+import { Secp256k1, Signature } from 'viem'
 
-const signature = parseSignature(hex)
-const hex = serializeSignature(signature)
-const address = await recoverAddress({ hash, signature })
-const publicKey = recoverPublicKey({ hash, signature })
+const signature = Signature.fromHex(hex)
+const hex = Signature.toHex(signature)
+const address = Secp256k1.recoverAddress({ payload: hash, signature })
+const publicKey = Secp256k1.recoverPublicKey({ payload: hash, signature })
```

[EIP-2098](https://eips.ethereum.org/EIPS/eip-2098) compact signature utilities moved to the `SignatureErc2098` namespace, including the deprecated `compactSignatureToHex` and `hexToCompactSignature` aliases. (`Signature.toCompactBytes`/`Signature.fromCompactBytes` are a plain `r ++ s` encoding that does not carry `yParity` — use `SignatureErc2098` for EIP-2098 semantics.)

```diff
-import {
-  type CompactSignature,
-  compactSignatureToSignature,
-  parseCompactSignature,
-  serializeCompactSignature,
-  signatureToCompactSignature,
-} from 'viem'
+import { SignatureErc2098 } from 'viem'

-const compact = signatureToCompactSignature(signature)
-const signature = compactSignatureToSignature(compact)
-const serialized = serializeCompactSignature(compact)
-const compact = parseCompactSignature(serialized)
+const compact = SignatureErc2098.from(signature)
+const signature = SignatureErc2098.toSignature(compact)
+const serialized = SignatureErc2098.toHex(compact)
+const compact = SignatureErc2098.fromHex(serialized)

- type Compact = CompactSignature
+ type Compact = SignatureErc2098.SignatureErc2098
```

Message, typed-data, and transaction address recovery moved to their owning namespaces and became synchronous.

```diff
-import { recoverMessageAddress, recoverTransactionAddress, recoverTypedDataAddress } from 'viem'
+import { PersonalMessage, TxEnvelope, TypedData } from 'viem'

-const address = await recoverMessageAddress({ message, signature })
-const address = await recoverTypedDataAddress({ ...typedData, signature })
-const address = await recoverTransactionAddress({ serializedTransaction, signature })
+const address = PersonalMessage.recoverAddress({ message, signature })
+const address = TypedData.recoverAddress({ ...typedData, signature })
+const address = TxEnvelope.recoverAddress(serializedTransaction, { signature })
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
-import { isErc6492Signature, isErc8010Signature, parseErc6492Signature, parseErc8010Signature, serializeErc6492Signature, serializeErc8010Signature } from 'viem'
+import { SignatureErc6492, SignatureErc8010 } from 'viem'
 
-const erc6492 = parseErc6492Signature(wrapped)
-const wrapped6492 = serializeErc6492Signature(erc6492)
-const erc8010 = parseErc8010Signature(wrapped)
-const wrapped8010 = serializeErc8010Signature(erc8010)
-const is6492 = isErc6492Signature(wrapped)
-const is8010 = isErc8010Signature(wrapped)
+const erc6492 = SignatureErc6492.unwrap(wrapped)
+const wrapped6492 = SignatureErc6492.wrap(erc6492)
+const erc8010 = SignatureErc8010.unwrap(wrapped)
+const wrapped8010 = SignatureErc8010.wrap(erc8010)
+const is6492 = SignatureErc6492.validate(wrapped)
+const is8010 = SignatureErc8010.validate(wrapped)
```

ERC-6492 magic bytes, validator ABI, and validator bytecode moved to `SignatureErc6492`. The deprecated `universalSignatureValidatorByteCode` alias was removed with them.

```diff
- import { erc6492MagicBytes, erc6492SignatureValidatorByteCode } from 'viem'
+ import { SignatureErc6492 } from 'viem'

- erc6492MagicBytes
+ SignatureErc6492.magicBytes
- erc6492SignatureValidatorByteCode
+ SignatureErc6492.universalSignatureValidatorBytecode
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
