---
"viem": major
---

ENS name helpers moved from flat exports to the `Ens` namespace.

```diff
-import { labelhash, namehash, normalize } from 'viem'
+import { Ens } from 'viem'
 
-const node = namehash(name)
-const label = labelhash('wagmi')
-const normalized = normalize(name)
+const node = Ens.namehash(name)
+const label = Ens.labelhash('wagmi')
+const normalized = Ens.normalize(name)
```

SIWE message creation, parsing, validation, and nonce generation moved from flat exports to the `Siwe` namespace.

```diff
-import { createSiweMessage, generateSiweNonce, parseSiweMessage, validateSiweMessage } from 'viem/siwe'
+import { Siwe } from 'viem'
 
-const nonce = generateSiweNonce()
-const message = createSiweMessage({ address, chainId, domain, nonce, uri, version: '1' })
-const parsed = parseSiweMessage(message)
-const valid = validateSiweMessage({ address, message })
+const nonce = Siwe.generateNonce()
+const message = Siwe.createMessage({ address, chainId, domain, nonce, uri, version: '1' })
+const parsed = Siwe.parseMessage(message)
+const valid = Siwe.validateMessage({ address, message })
```

Personal message hashing and typed-data hashing moved from flat signature helpers to `PersonalMessage` and `TypedData` namespaces.

```diff
-import { hashMessage, hashTypedData } from 'viem'
+import { Hex, PersonalMessage, TypedData } from 'viem'
 
-const messageHash = hashMessage('hello world')
-const typedDataHash = hashTypedData({ domain, types, primaryType, message })
+const messageHash = PersonalMessage.getSignPayload(Hex.fromString('hello world'))
+const typedDataHash = TypedData.getSignPayload({ domain, types, primaryType, message })
```

The `presignMessagePrefix` constant was removed; `PersonalMessage.encode` now owns prefixing.

```diff
- import { presignMessagePrefix } from 'viem'
+ import { Hex, PersonalMessage } from 'viem'

- const payload = `${presignMessagePrefix}${message.length}${message}`
+ const payload = PersonalMessage.encode(Hex.fromString(message))
```
