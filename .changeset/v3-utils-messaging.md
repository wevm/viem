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

SIWE message creation, parsing, validation, and nonce generation moved from flat exports to the `Siwe` namespace. The `SiweMessage` type moved to `Siwe.Message`, and its `chainId` field changed from `number` to `bigint`.

```diff
-import { createSiweMessage, generateSiweNonce, parseSiweMessage, validateSiweMessage, type SiweMessage } from 'viem/siwe'
+import { Siwe } from 'viem'
 
-const nonce = generateSiweNonce()
-const message = createSiweMessage({ address, chainId: 1, domain, nonce, uri, version: '1' })
-const parsed = parseSiweMessage(message)
-const valid = validateSiweMessage({ address, message })
+const nonce = Siwe.generateNonce()
+const message = Siwe.createMessage({ address, chainId: 1n, domain, nonce, uri, version: '1' })
+const parsed = Siwe.parseMessage(message)
+const valid = Siwe.validateMessage({ address, message })

- type Message = SiweMessage
+ type Message = Siwe.Message
```

The SIWE invalid-field error moved to the `Siwe` namespace.

```diff
-import { SiweInvalidMessageFieldError } from 'viem/siwe'
+import { Siwe } from 'viem'

-error instanceof SiweInvalidMessageFieldError
+error instanceof Siwe.InvalidMessageFieldError
```

ENS avatar-record and packet helpers were internalized; higher-level avatar resolution moved to `Actions.ens.getAvatar`, and the coin-type error moved to `Ens.InvalidChainIdError`.

```diff
-import { parseAvatarRecord, packetToBytes, ToCoinTypeError } from 'viem/ens'
+import { Actions, Ens } from 'viem'

-const avatar = await parseAvatarRecord(client, { record, gatewayUrls })
-const packet = packetToBytes(name)
+const avatar = await Actions.ens.getAvatar(client, { name, assetGatewayUrls })
+Ens.InvalidChainIdError
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

The `presignMessagePrefix` constant and `toPrefixedMessage` were removed; `PersonalMessage.encode` now owns prefixing. It accepts hex or bytes only — convert plain strings first.

```diff
- import { presignMessagePrefix, toPrefixedMessage } from 'viem'
+ import { Hex, PersonalMessage } from 'viem'

- const payload = `${presignMessagePrefix}${message.length}${message}`
- const payload = toPrefixedMessage(message)
+ const payload = PersonalMessage.encode(Hex.fromString(message))
```

Typed-data utilities moved from flat exports to the `TypedData` namespace, along with their types.

```diff
- import {
-   getTypesForEIP712Domain,
-   serializeTypedData,
-   validateTypedData,
-   type TypedDataDefinition,
-   type TypedDataDomain,
-   type TypedDataParameter,
- } from 'viem'
+ import { TypedData } from 'viem'

- const types = getTypesForEIP712Domain({ domain })
- const serialized = serializeTypedData(definition)
- validateTypedData(definition) // throws on invalid
+ const types = TypedData.extractEip712DomainTypes(domain)
+ const serialized = TypedData.serialize(definition)
+ TypedData.assert(definition) // throws on invalid

- type Definition = TypedDataDefinition<typedData, primaryType>
- type Domain = TypedDataDomain
- type Parameter = TypedDataParameter
+ type Definition = TypedData.Definition<typedData, primaryType>
+ type Domain = TypedData.Domain
+ type Parameter = TypedData.Parameter
```

Note that `TypedData.validate` returns a boolean — the throwing equivalent of v2 `validateTypedData` is `TypedData.assert`.
