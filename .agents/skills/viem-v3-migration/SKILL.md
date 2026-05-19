---
name: viem-v3-migration
description: Reference landed Viem v3 APIs for consumers and agents. Use when checking the current v3 public surface or looking up v2 utility wrapper equivalents.
---

# Viem v3 Reference

Reference for the Viem v3 public surface that has already landed. This file is
for consumers and agents to look up canonical imports and wrapper equivalents.

Only landed modules are documented here.

## Core

| Export | Backing | Notes |
| --- | --- | --- |
| `BaseError` | `ox/Errors.BaseError` | Viem-versioned base error exported from `viem`. Defaults docs links to `https://viem.sh` and message versions to `viem@<version>`. |
| `Chain` | `src/core/Chain.ts` | Chain definition module exported from `viem` and `viem/Chain`. Use `Chain.define` for custom chain definitions. |

### `Chain`

Chain constants remain flat under `viem/chains`. Custom chain definitions move
under the `Chain` module, and chain IDs are bigint.

```diff
- import { defineChain } from 'viem'
+ import { Chain } from 'viem'

- const chain = defineChain({ id: 1, ... })
+ const chain = Chain.define({ id: 1n, ... })
```

| v2 | v3 |
| --- | --- |
| `defineChain(options)` | `Chain.define(options)` |
| `extendSchema<schema>()` | `Chain.extendSchema<schema>()` |

`Chain.define` requires `id` and `sourceId` as `bigint`. Convert v2 numeric IDs
to bigint literals or `BigInt(...)` before calling it.

```diff
- Chain.define({ id: 1, sourceId: 1, ... })
+ Chain.define({ id: 1n, sourceId: 1n, ... })
```

```diff
- const chain = defineChain({
-   extendSchema: extendSchema<{ feeToken: Address.Address }>(),
-   ...
- })
+ const chain = Chain.define({
+   extendSchema: Chain.extendSchema<{ feeToken: Address.Address }>(),
+   ...
+ })
+
 const extended = chain.extend({ feeToken })
```

## Utilities

Ox-backed utility modules are exposed from `viem/utils`.

Current utility modules:

| Module | Backing | Notes |
| --- | --- | --- |
| `Abi` | `ox/Abi` | Exact proxy. ABI parsing, formatting, encoding, and selector helpers. |
| `AbiConstructor` | `ox/AbiConstructor` | Exact proxy. ABI constructor helpers. |
| `AbiError` | `ox/AbiError` | Exact proxy. ABI error helpers. |
| `AbiEvent` | `ox/AbiEvent` | Exact proxy. ABI event helpers. |
| `AbiFunction` | `ox/AbiFunction` | Exact proxy. ABI function helpers. `decodeData` and `decodeResult` checksum decoded addresses by default. |
| `AbiItem` | `ox/AbiItem` | Exact proxy. ABI item helpers. |
| `AbiParameters` | `ox/AbiParameters` | Exact proxy. ABI parameter encoding, decoding, formatting, and parsing. `decode` checksums decoded addresses by default. |
| `AccessList` | `ox/AccessList` | Exact proxy. Access-list construction and RPC conversion. |
| `Address` | `ox/Address` | Exact proxy. Address validation, checksum, equality, and public-key derivation. |
| `Authorization` | `ox/Authorization` | Exact proxy. EIP-7702 authorization signing and RPC conversion. |
| `Block` | `ox/Block` | Exact proxy. Block domain and RPC conversion. |
| `BlockOverrides` | `ox/BlockOverrides` | Exact proxy. Block override RPC conversion. |
| `Blobs` | `ox/Blobs` | Exact proxy. EIP-4844 blob construction, commitments, versioned hashes, and PeerDAS cell proofs. |
| `Bytes` | `ox/Bytes` | Exact proxy. Byte-array construction, conversion, slicing, padding, and trimming. |
| `Ccip` | `src/utils/Ccip.ts` | Viem-owned EIP-3668 CCIP-read gateway requests and batch tunnel creation. |
| `ContractAddress` | `ox/ContractAddress` | Exact proxy. CREATE and CREATE2 address derivation. |
| `Ens` | `ox/Ens` | Exact proxy. ENS normalization, namehashing, labelhashing, and coin type conversion. |
| `Fee` | `ox/Fee` | Exact proxy. Fee history and RPC conversion. |
| `Filter` | `ox/Filter` | Exact proxy. Filter domain and RPC conversion. |
| `Hash` | `ox/Hash` | Exact proxy. Keccak, SHA-256, RIPEMD-160, HMAC-SHA256, and hash validation. |
| `Hex` | `ox/Hex` | Exact proxy. Hex construction, conversion, slicing, padding, and trimming. |
| `Kzg` | `ox/Kzg` | Exact proxy. KZG interface wrapper and versioned-hash constants. |
| `Log` | `ox/Log` | Exact proxy. Log domain and RPC conversion, including optional `blockTimestamp`. |
| `NonceManager` | `src/utils/NonceManager.ts` | Viem-owned nonce manager. Create explicit manager instances with `NonceManager.create`. |
| `P256` | `ox/P256` | Exact proxy. P-256 key, signing, recovery, and verification helpers. |
| `PersonalMessage` | `ox/PersonalMessage` | Exact proxy. EIP-191 encoding and signing payload hashing. |
| `Provider` | `ox/Provider` | Exact proxy. EIP-1193 provider helpers and types. |
| `PublicKey` | `ox/PublicKey` | Exact proxy. Structured public-key parsing, compression, and serialization. |
| `Rlp` | `ox/Rlp` | Exact proxy. RLP encode and decode helpers. |
| `RpcRequest` | `ox/RpcRequest` | Exact proxy. JSON-RPC request helpers. |
| `RpcResponse` | `ox/RpcResponse` | Exact proxy. JSON-RPC response helpers. |
| `RpcSchema` | `ox/RpcSchema` | Exact proxy. JSON-RPC schema types. |
| `RpcTransport` | `ox/RpcTransport` | Exact proxy. JSON-RPC transport helpers. |
| `Secp256k1` | `ox/Secp256k1` | Exact proxy. Secp256k1 key, signing, recovery, and verification helpers. |
| `Signature` | `ox/Signature` | Exact proxy. Signature parsing, serialization, RPC conversion, DER conversion, and validation. |
| `SignatureErc6492` | `ox/erc6492/SignatureErc6492` | Exact proxy. ERC-6492 wrapped signature parsing, wrapping, and validation. |
| `SignatureErc8010` | `ox/erc8010/SignatureErc8010` | Exact proxy. ERC-8010 wrapped signature parsing, wrapping, and validation. |
| `Siwe` | `ox/Siwe` | Exact proxy. EIP-4361 SIWE message creation, parsing, validation, and nonce generation. |
| `StateOverrides` | `ox/StateOverrides` | Exact proxy. State override RPC conversion. |
| `Transaction` | `ox/Transaction` | Exact proxy. Transaction domain and RPC conversion. |
| `TransactionReceipt` | `ox/TransactionReceipt` | Exact proxy. Transaction receipt domain and RPC conversion. |
| `TransactionRequest` | `ox/TransactionRequest` | Exact proxy. Transaction request RPC conversion. |
| `TxEnvelope` | `ox/TxEnvelope` | Exact proxy. Transaction envelope helpers. |
| `TxEnvelopeEip1559` | `ox/TxEnvelopeEip1559` | Exact proxy. EIP-1559 transaction envelope helpers. |
| `TxEnvelopeEip2930` | `ox/TxEnvelopeEip2930` | Exact proxy. EIP-2930 transaction envelope helpers. |
| `TxEnvelopeEip4844` | `ox/TxEnvelopeEip4844` | Exact proxy. EIP-4844 transaction envelope helpers. |
| `TxEnvelopeEip7702` | `ox/TxEnvelopeEip7702` | Exact proxy. EIP-7702 transaction envelope helpers. |
| `TxEnvelopeLegacy` | `ox/TxEnvelopeLegacy` | Exact proxy. Legacy transaction envelope helpers. |
| `TypedData` | `ox/TypedData` | Exact proxy. EIP-712 encoding, hashing, serialization, and validation. |
| `Value` | `ox/Value` | Exact proxy. Unit formatting and parsing. |
| `WebAuthnP256` | `ox/WebAuthnP256` | Exact proxy. WebAuthn P-256 credential, signing, and verification helpers. |
| `WebCryptoP256` | `ox/WebCryptoP256` | Exact proxy. WebCrypto P-256 key, signing, and verification helpers. |
| `Withdrawal` | `ox/Withdrawal` | Exact proxy. Withdrawal domain and RPC conversion. |

```diff
- import { concatHex, formatEther } from 'viem'
+ import { Hex, Value } from 'viem/utils'

- concatHex(values)
+ Hex.concat(...values)

- formatEther(value)
+ Value.formatEther(value)
```

### `AbiParameters`

| v2 | v3 |
| --- | --- |
| `encodeAbiParameters(params, values)` | `AbiParameters.encode(params, values)` |
| `decodeAbiParameters(params, data)` | `AbiParameters.decode(params, data)` |
| `encodePacked(types, values)` | `AbiParameters.encodePacked(types, values)` |
| `parseAbiParameters(value)` | `AbiParameters.from(value)` |

```diff
- import { encodeAbiParameters, parseAbiParameters } from 'viem'
+ import { AbiParameters } from 'viem/utils'

- encodeAbiParameters(parseAbiParameters('address account'), [account])
+ AbiParameters.encode(AbiParameters.from('address account'), [account])
```

`AbiParameters.decode` checksums decoded addresses by default. Pass
`{ checksumAddress: false }` when lowercase address output is needed.

### `AbiFunction`

| v2 | v3 |
| --- | --- |
| `encodeFunctionData({ abi, functionName, args })` | `AbiFunction.encodeData(abi, functionName, args)` |
| `decodeFunctionData({ abi, data })` | `AbiFunction.decodeData(abi, data)` |
| `decodeFunctionResult({ abi, functionName, data })` | `AbiFunction.decodeResult(abi, functionName, data)` |
| `encodeFunctionResult({ abi, functionName, result })` | `AbiFunction.encodeResult(abi, functionName, result)` |
| `prepareEncodeFunctionData(options)` | `AbiFunction.fromAbi(...)` and `AbiFunction.getSelector(...)` |

```diff
- import { encodeFunctionData } from 'viem'
+ import { AbiFunction } from 'viem/utils'

- encodeFunctionData({ abi, functionName: 'approve', args })
+ AbiFunction.encodeData(abi, 'approve', args)
```

`AbiFunction.decodeData(abi, data)` extracts the function from calldata's
4-byte selector and returns decoded function inputs only.
`AbiFunction.decodeData` and `AbiFunction.decodeResult` checksum decoded
addresses by default.

### `AbiEvent`

| v2 | v3 |
| --- | --- |
| `encodeEventTopics({ abi, eventName, args })` | `AbiEvent.encode(abi, eventName, args)` |
| `decodeEventLog({ abi, data, topics })` | `AbiEvent.decodeLog(abi, { data, topics })` |
| `decodeEventLog({ abi, eventName, data, topics })` | `AbiEvent.decode(abi, eventName, { data, topics })` |
| `parseEventLogs({ abi, logs, ...options })` | `AbiEvent.extractLogs(abi, logs, options)` |

```diff
- import { decodeEventLog } from 'viem'
+ import { AbiEvent } from 'viem/utils'

- decodeEventLog({ abi, data, topics })
+ AbiEvent.decodeLog(abi, { data, topics })
```

`AbiEvent.decodeLog` returns `{ event, args }`. The `event` value is the
selected ABI event object, not the v2 `eventName` string.
`AbiEvent.extractLogs` matches the v2 `parseEventLogs` behavior and returns
logs with `eventName` and `args`.

### `AbiError`

| v2 | v3 |
| --- | --- |
| `encodeErrorResult({ abi, errorName, args })` | `AbiError.encode(abi, errorName, args)` |
| `decodeErrorResult({ abi, data })` | `AbiError.extract(abi, data)` |

```diff
- import { decodeErrorResult, encodeErrorResult } from 'viem'
+ import { AbiError } from 'viem/utils'

- encodeErrorResult({ abi, errorName: 'InvalidToken', args })
+ AbiError.encode(abi, 'InvalidToken', args)

- const { abiItem, errorName, args } = decodeErrorResult({ abi, data })
+ const { error, args } = AbiError.extract(abi, data)
+ const errorName = error.name
```

`AbiError.extract` returns `{ error, args }`. The `error` value replaces the v2
`abiItem`/`errorName` pair. `AbiError.decode` remains for known ABI error items.

### `AbiConstructor`

| v2 | v3 |
| --- | --- |
| `encodeDeployData({ abi, bytecode, args })` | `AbiConstructor.encode(abi, { bytecode, args })` |
| `decodeDeployData({ abi, bytecode, data })` | `AbiConstructor.decode(abi, { bytecode, data })` |

```diff
- import { encodeDeployData } from 'viem'
+ import { AbiConstructor } from 'viem/utils'

- encodeDeployData({ abi, bytecode, args })
+ AbiConstructor.encode(abi, { bytecode, args })
```

`AbiConstructor.decode` returns decoded constructor args. The bytecode remains an
input option, not part of the decoded return value.

### `AccessList`

| v2 | v3 |
| --- | --- |
| `serializeAccessList(accessList)` | `AccessList.toTupleList(accessList)` |
| `type AccessList` | `type AccessList.AccessList` |

```diff
- import { serializeAccessList } from 'viem'
+ import { AccessList } from 'viem/utils'

- serializeAccessList(accessList)
+ AccessList.toTupleList(accessList)
```

Use `AccessList.fromTupleList(tupleList)` for the inverse conversion.
`InvalidStorageKeySizeError` is colocated at
`AccessList.InvalidStorageKeySizeError`.

### `Authorization`

| v2 | v3 |
| --- | --- |
| `hashAuthorization({ address, chainId, nonce })` | `Authorization.getSignPayload(Authorization.from({ address, chainId, nonce }))` |
| `serializeAuthorizationList(list)` | `Authorization.toTupleList(list)` |
| `recoverAuthorizationAddress({ authorization, signature })` | `Secp256k1.recoverAddress({ payload, signature })` |
| `verifyAuthorization({ address, authorization, signature })` | `Secp256k1.verify({ address, payload, signature })` |

```diff
- import { hashAuthorization, verifyAuthorization } from 'viem'
+ import { Authorization, Secp256k1 } from 'viem/utils'

- const hash = hashAuthorization({ address, chainId, nonce })
+ const authorization = Authorization.from({ address, chainId, nonce })
+ const payload = Authorization.getSignPayload(authorization)

- await verifyAuthorization({ address: signer, authorization, signature })
+ Secp256k1.verify({ address: signer, payload, signature })
```

`contractAddress` is removed from authorization requests. Use `address`.
`hashAuthorization({ to: 'bytes' })` is removed; convert the payload with
`Bytes.fromHex(...)` when byte output is needed.

### `Blobs`

| v2 | v3 |
| --- | --- |
| `toBlobs({ data })` | `Blobs.from(data)` |
| `fromBlobs({ blobs })` | `Blobs.to(blobs)` |
| `blobsToCommitments({ blobs, kzg })` | `Blobs.toCommitments(blobs, { kzg })` |
| `commitmentToVersionedHash({ commitment })` | `Blobs.commitmentToVersionedHash(commitment)` |
| `commitmentsToVersionedHashes({ commitments })` | `Blobs.commitmentsToVersionedHashes(commitments)` |
| `sidecarsToVersionedHashes({ sidecars })` | `Blobs.commitmentsToVersionedHashes(sidecars.map((x) => x.commitment))` |

```diff
- import { blobsToCommitments, toBlobs } from 'viem'
+ import { Blobs } from 'viem/utils'

- const blobs = toBlobs({ data })
- const commitments = blobsToCommitments({ blobs, kzg })
+ const blobs = Blobs.from(data)
+ const commitments = Blobs.toCommitments(blobs, { kzg })
```

Output discriminator options use Ox casing: `{ as: 'Hex' }` or
`{ as: 'Bytes' }`.

`blobsToProofs`, `toBlobSidecars`, `BlobSidecar`, and `BlobSidecars` are
removed.

### `Kzg`

| v2 | v3 |
| --- | --- |
| `defineKzg(kzg)` | `Kzg.from(kzg)` |
| `setupKzg(kzg, path)` | `kzg.loadTrustedSetup(path); Kzg.from(kzg)` |
| `type Kzg` | `type Kzg.Kzg` |

```diff
- import { setupKzg } from 'viem'
+ import { Kzg } from 'viem/utils'

- const kzg = setupKzg(cKzg, trustedSetupPath)
+ cKzg.loadTrustedSetup(trustedSetupPath)
+ const kzg = Kzg.from(cKzg)
```

`Kzg.from` expects the Ox KZG interface, including PeerDAS cell methods. The old
`computeBlobKzgProof` public requirement is removed with `blobsToProofs`.

### `NonceManager`

| v2 | v3 |
| --- | --- |
| `createNonceManager({ source })` | `NonceManager.create({ source })` |
| `jsonRpc()` | `NonceManager.jsonRpc()` |
| `nonceManager` | Removed. Create and share an explicit manager. |
| `type NonceManager` | `type NonceManager.NonceManager` |
| `type NonceManagerSource` | `type NonceManager.Source` |
| `type CreateNonceManagerParameters` | `type NonceManager.create.Options` |
| `viem/nonce` | Removed. Use `viem/utils/NonceManager`. |

```diff
- import { createNonceManager, jsonRpc, nonceManager } from 'viem/nonce'
+ import { NonceManager } from 'viem/utils'

- const manager = nonceManager
+ const manager = NonceManager.create({
+   source: NonceManager.jsonRpc(),
+ })

- const custom = createNonceManager({ source: jsonRpc() })
+ const custom = NonceManager.create({ source: NonceManager.jsonRpc() })
```

`NonceManager` keys use bigint chain IDs. Convert v2 numeric chain IDs before
calling `get`, `consume`, `increment`, or `reset`.

### `StateOverrides`

| v2 | v3 |
| --- | --- |
| `serializeStateOverride([{ address, ...account }])` | `StateOverrides.toRpc({ [address]: account })` |
| `serializeStateMapping([{ slot, value }])` | `{ [slot]: value }` |
| `type StateOverride` | `type StateOverrides.StateOverrides` |
| `type StateMapping` | `type StateOverrides.AccountStorage` |
| `type RpcStateOverride` | `type StateOverrides.Rpc` |

```diff
- import { serializeStateOverride } from 'viem'
+ import { StateOverrides } from 'viem/utils'

- serializeStateOverride([
-   {
-     address,
-     balance: 1n,
-     stateDiff: [{ slot, value }],
-   },
- ])
+ StateOverrides.toRpc({
+   [address]: {
+     balance: 1n,
+     stateDiff: { [slot]: value },
+   },
+ })
```

State overrides now use the Ox object shape keyed by address. Account storage is
keyed by slot instead of an array of `{ slot, value }` entries.

### `Ccip`

| v2 | v3 |
| --- | --- |
| `ccipRequest(options)` | `Ccip.request(options)` |
| `ccipReadTunnel(options)` | `Ccip.createTunnel(options)` |
| `ccipFetch` | Removed. Use `Ccip.request`. |
| `offchainLookupAbiItem` | `Ccip.offchainLookupAbiItem` |
| `offchainLookupSignature` | `Ccip.offchainLookupSignature` |

```diff
- import { ccipRequest, ccipReadTunnel } from 'viem'
+ import { Ccip } from 'viem/utils'

- const data = await ccipRequest({ data, sender, urls })
+ const data = await Ccip.request({ data, sender, urls })

- const ccipRead = ccipReadTunnel({ batchGateways })
+ const ccipRead = Ccip.createTunnel({ batchGateways })
```

`offchainLookup(client, options)` is not part of the landed v3 utility surface.
Client/action-owned CCIP callback handling will be documented with the relevant
action module.

### `Ens`

| v2 | v3 |
| --- | --- |
| `labelhash(label)` | `Ens.labelhash(label)` |
| `namehash(name)` | `Ens.namehash(name)` |
| `normalize(name)` | `Ens.normalize(name)` |
| `toCoinType(chainId)` | `Ens.toCoinType(chainId)` |

```diff
- import { namehash, normalize, toCoinType } from 'viem'
+ import { Ens } from 'viem/utils'

- namehash(normalize('wevm.eth'))
+ Ens.namehash(Ens.normalize('wevm.eth'))

- toCoinType(chain.id)
+ Ens.toCoinType(chain.id)
```

`Ens.toCoinType` accepts `bigint`, matching v3 chain IDs. Convert v2 numeric
chain IDs before calling it.

The `viem/ens` entrypoint directly re-exports the same module surface.

```diff
- import { namehash } from 'viem/ens'
+ import * as Ens from 'viem/ens'

- namehash('wevm.eth')
+ Ens.namehash('wevm.eth')
```

ENS actions are reviewed separately.

### `SignatureErc6492`

| v2 | v3 |
| --- | --- |
| `isErc6492Signature(signature)` | `SignatureErc6492.validate(signature)` |
| `parseErc6492Signature(signature)` | `SignatureErc6492.unwrap(signature)` |
| `serializeErc6492Signature({ address, data, signature })` | `SignatureErc6492.wrap({ to: address, data, signature })` |
| `serializeErc6492Signature({ to: 'bytes', ... })` | `Bytes.fromHex(SignatureErc6492.wrap(...))` |

```diff
- import { isErc6492Signature, serializeErc6492Signature } from 'viem'
+ import { SignatureErc6492 } from 'viem/utils'

- isErc6492Signature(signature)
+ SignatureErc6492.validate(signature)

- serializeErc6492Signature({ address, data, signature })
+ SignatureErc6492.wrap({ to: address, data, signature })
```

`SignatureErc6492.unwrap` expects a wrapped signature. If v2 pass-through
parsing is needed, use
`SignatureErc6492.validate(signature) ? SignatureErc6492.unwrap(signature) : { signature }`.

### `SignatureErc8010`

| v2 | v3 |
| --- | --- |
| `isErc8010Signature(signature)` | `SignatureErc8010.validate(signature)` |
| `parseErc8010Signature(signature)` | `SignatureErc8010.unwrap(signature)` |
| `serializeErc8010Signature({ address, authorization, data, signature })` | `SignatureErc8010.wrap({ to: address, authorization, data, signature })` |
| `serializeErc8010Signature({ to: 'bytes', ... })` | `Bytes.fromHex(SignatureErc8010.wrap(...))` |

```diff
- import { isErc8010Signature, serializeErc8010Signature } from 'viem'
+ import { SignatureErc8010 } from 'viem/utils'

- isErc8010Signature(signature)
+ SignatureErc8010.validate(signature)

- serializeErc8010Signature({ address, authorization, data, signature })
+ SignatureErc8010.wrap({ to: address, authorization, data, signature })
```

`SignatureErc8010.unwrap` expects a wrapped signature. If v2 pass-through
parsing is needed, use
`SignatureErc8010.validate(signature) ? SignatureErc8010.unwrap(signature) : { signature }`.

### `Siwe`

| v2 | v3 |
| --- | --- |
| `createSiweMessage(message)` | `Siwe.createMessage(message)` |
| `generateSiweNonce()` | `Siwe.generateNonce()` |
| `parseSiweMessage(message)` | `Siwe.parseMessage(message)` |
| `validateSiweMessage(options)` | `Siwe.validateMessage(options)` |
| `type SiweMessage` | `type Siwe.Message` |
| `SiweInvalidMessageFieldError` | `Siwe.InvalidMessageFieldError` |

```diff
- import { createSiweMessage, parseSiweMessage } from 'viem'
+ import { Siwe } from 'viem/utils'

- const message = createSiweMessage({ chainId: 1, ... })
+ const message = Siwe.createMessage({ chainId: 1n, ... })

- const parsed = parseSiweMessage(message)
+ const parsed = Siwe.parseMessage(message)
```

`Siwe.Message.chainId` is `bigint`, and `Siwe.parseMessage` returns parsed
chain IDs as `bigint`.

The `viem/siwe` entrypoint directly re-exports the same module surface.

```diff
- import { createSiweMessage } from 'viem/siwe'
+ import * as Siwe from 'viem/siwe'

- createSiweMessage(message)
+ Siwe.createMessage(message)
```

SIWE verification actions are reviewed separately.

### `Hex`

| v2 | v3 |
| --- | --- |
| `boolToHex` | `Hex.fromBoolean` |
| `bytesToHex` | `Hex.fromBytes` |
| `concatHex` | `Hex.concat` |
| `hexToBigInt` | `Hex.toBigInt` |
| `hexToBool` | `Hex.toBoolean` |
| `hexToBytes` | `Hex.toBytes` or `Bytes.fromHex` |
| `hexToNumber` | `Hex.toNumber` |
| `hexToString` | `Hex.toString` |
| `isHex` | `Hex.validate` |
| `numberToHex` | `Hex.fromNumber` |
| `padHex` | `Hex.padLeft` or `Hex.padRight` |
| `sliceHex` | `Hex.slice` |
| `stringToHex` | `Hex.fromString` |
| `trimHex` | `Hex.trimLeft` or `Hex.trimRight` |

### `Bytes`

| v2 | v3 |
| --- | --- |
| `boolToBytes` | `Bytes.fromBoolean` |
| `bytesToBigint` | `Bytes.toBigInt` |
| `bytesToBool` | `Bytes.toBoolean` |
| `bytesToHex` | `Bytes.toHex` or `Hex.fromBytes` |
| `bytesToNumber` | `Bytes.toNumber` |
| `bytesToString` | `Bytes.toString` |
| `concatBytes` | `Bytes.concat` |
| `hexToBytes` | `Bytes.fromHex` |
| `isBytes` | `Bytes.validate` |
| `numberToBytes` | `Bytes.fromNumber` |
| `padBytes` | `Bytes.padLeft` or `Bytes.padRight` |
| `sliceBytes` | `Bytes.slice` |
| `stringToBytes` | `Bytes.fromString` |
| `trimBytes` | `Bytes.trimLeft` or `Bytes.trimRight` |

### `Value`

| v2 | v3 |
| --- | --- |
| `formatEther` | `Value.formatEther` |
| `formatGwei` | `Value.formatGwei` |
| `formatUnits` | `Value.format` |
| `parseEther` | `Value.fromEther` |
| `parseGwei` | `Value.fromGwei` |
| `parseUnits` | `Value.from` |

### `Address`

| v2 | v3 |
| --- | --- |
| `getAddress(address)` | `Address.from(address, { checksum: true })` |
| `checksumAddress(address)` | `Address.checksum(address)` |
| `isAddress(value)` | `Address.validate(value)` |
| `isAddress(value, { strict })` | `Address.validate(value, { strict })` |
| `isAddressEqual(a, b)` | `Address.isEqual(a, b)` |
| `isAddressCache` | Removed. Public cache handles are not exposed. |

`Address.from` does not checksum by default. Use `{ checksum: true }` when
preserving v2 `getAddress` casing behavior. The v2 `chainId` argument for
EIP-1191 checksums is removed.

### `ContractAddress`

| v2 | v3 |
| --- | --- |
| `getContractAddress({ opcode: 'CREATE', ... })` | `ContractAddress.from({ opcode: 'CREATE', ... })` or `ContractAddress.fromCreate(...)` |
| `getContractAddress({ opcode: 'CREATE2', ... })` | `ContractAddress.from({ opcode: 'CREATE2', ... })` or `ContractAddress.fromCreate2(...)` |
| `getCreateAddress(options)` | `ContractAddress.fromCreate(options)` |
| `getCreate2Address(options)` | `ContractAddress.fromCreate2(options)` |

Ox contract address helpers return lowercase addresses. Pass through
`Address.checksum` if EIP-55 casing is required.

### `Hash`

| v2 | v3 |
| --- | --- |
| `keccak256(value)` | `Hash.keccak256(value)` |
| `keccak256(value, 'bytes')` | `Hash.keccak256(value, { as: 'Bytes' })` |
| `sha256(value)` | `Hash.sha256(value)` |
| `sha256(value, 'bytes')` | `Hash.sha256(value, { as: 'Bytes' })` |
| `ripemd160(value)` | `Hash.ripemd160(value)` |
| `ripemd160(value, 'bytes')` | `Hash.ripemd160(value, { as: 'Bytes' })` |
| `isHash(value)` | `Hash.validate(value)` |

`Hash.*` defaults to hex output for hex inputs and bytes output for byte-array
inputs.

### RPC Boundaries

Old formatter helpers are replaced by explicit domain module conversion methods.

| v2 | v3 |
| --- | --- |
| `formatBlock(block)` | `Block.fromRpc(block)` |
| `formatLog(log)` | `Log.fromRpc(log)` |
| `formatTransaction(transaction)` | `Transaction.fromRpc(transaction)` |
| `formatTransactionReceipt(receipt)` | `TransactionReceipt.fromRpc(receipt)` |
| `formatTransactionRequest(request)` | `TransactionRequest.toRpc(request)` |

Use `fromRpc` for inbound RPC responses and `toRpc` for outbound RPC payloads.
Chain-specific formatter work should override only the chain-specific RPC
deltas.

### `Block`

| v2 | v3 |
| --- | --- |
| `formatBlock(block)` | `Block.fromRpc(block)` |
| `defineBlock(...)` | chain `formatters.block.fromRpc` / `formatters.block.toRpc` |
| `type Block` | `type Block.Block` |
| `type RpcBlock` | `type Block.Rpc` |
| `type BlockIdentifier` | `type Block.Identifier` |
| `type RpcBlockIdentifier` | `type Block.Identifier<Hex.Hex>` |
| `type BlockNumber` | `type Block.Number` |
| `type RpcBlockNumber` | `type Block.Number<Hex.Hex>` |
| `type BlockTag` | `type Block.Tag` |

```diff
- import { formatBlock } from 'viem'
+ import { Block } from 'viem/utils'

- const block = formatBlock(rpcBlock)
+ const block = Block.fromRpc(rpcBlock)
```

`Block.fromRpc` expects RPC-domain block objects, not formatter partials.
Missing optional RPC fields may remain `undefined` instead of becoming `null`.

### `Log`

| v2 | v3 |
| --- | --- |
| `formatLog(log)` | `Log.fromRpc(log)` |
| `type Log` | `type Log.Log` |
| `type RpcLog` | `type Log.Rpc` |

```diff
- import { formatLog } from 'viem'
+ import { Log } from 'viem/utils'

- const log = formatLog(rpcLog)
+ const log = Log.fromRpc(rpcLog)
```

`Log.fromRpc` converts optional `blockTimestamp`: hex timestamps become
`bigint`, while `null` and `undefined` are preserved.

### `Withdrawal`

| v2 | v3 |
| --- | --- |
| `type Withdrawal` | `type Withdrawal.Rpc` |
| withdrawal conversion inside `formatBlock` | `Withdrawal.fromRpc(withdrawal)` |

```diff
- import type { Withdrawal } from 'viem'
+ import { Withdrawal } from 'viem/utils'

- type RpcWithdrawal = Withdrawal
+ type RpcWithdrawal = Withdrawal.Rpc
```

Use `Withdrawal.Withdrawal` for normalized domain values and `Withdrawal.Rpc`
for RPC-shaped values with hex quantities.

### `PersonalMessage`

| v2 | v3 |
| --- | --- |
| `toPrefixedMessage(message)` | `PersonalMessage.encode(data)` |
| `hashMessage(message)` | `PersonalMessage.getSignPayload(data)` |
| `recoverMessageAddress({ message, signature })` | `Secp256k1.recoverAddress({ payload: PersonalMessage.getSignPayload(data), signature })` |
| `verifyMessage({ address, message, signature })` | `Secp256k1.verify({ address, payload: PersonalMessage.getSignPayload(data), signature })` |

`PersonalMessage` accepts raw `Hex` or `Bytes`. Convert strings first, then pass
the resulting payload to a curve module, for example
`Secp256k1.verify({ address, payload: PersonalMessage.getSignPayload(Hex.fromString(message)), signature })`.

### `Rlp`

| v2 | v3 |
| --- | --- |
| `toRlp(value, 'hex')` | `Rlp.fromHex(value)` for hex input, or `Hex.fromBytes(Rlp.fromBytes(value))` for bytes input |
| `toRlp(value, 'bytes')` | `Rlp.from(value, { as: 'Bytes' })` |
| `bytesToRlp(value)` | `Rlp.fromBytes(value)` |
| `bytesToRlp(value, 'hex')` | `Hex.fromBytes(Rlp.fromBytes(value))` |
| `hexToRlp(value)` | `Rlp.fromHex(value)` |
| `hexToRlp(value, 'bytes')` | `Rlp.fromHex(value, { as: 'Bytes' })` |
| `fromRlp(value, 'hex')` | `Rlp.toHex(value)` or `Rlp.to(value, 'Hex')` |
| `fromRlp(value, 'bytes')` | `Rlp.toBytes(value)` or `Rlp.to(value, 'Bytes')` |

### `Signature`

| v2 | v3 |
| --- | --- |
| `parseSignature(hex)` | `Signature.fromHex(hex)` |
| `serializeSignature(signature)` | `Signature.toHex(signature)` |
| `signatureToHex(signature)` | `Signature.toHex(signature)` |
| `parseCompactSignature(hex)` | `Signature.fromCompactBytes(Hex.toBytes(hex))` |
| `serializeCompactSignature(signature)` | `Hex.fromBytes(Signature.toCompactBytes(signature))` |
| `compactSignatureToSignature(signature)` | `Signature.fromCompactBytes(...)` |
| `signatureToCompactSignature(signature)` | `Signature.toCompactBytes(signature)` |
| `toSignature(value)` | `Signature.from(value)` |
| `normalizeSignature(value)` | `Signature.from(value)` |
| `recoverAddress({ hash, signature })` | `Secp256k1.recoverAddress({ payload: hash, signature })` |
| `recoverPublicKey({ hash, signature })` | `PublicKey.toHex(Secp256k1.recoverPublicKey({ payload: hash, signature }))` |
| `verifyHash({ address, hash, signature })` | `Secp256k1.verify({ address, payload: hash, signature })` |
| `hashSignature(signature)` | `Hash.keccak256(Signature.toHex(signature))` |

`Signature` is for signature data and format conversion. Signing, verification,
and recovery live under curve modules such as `Secp256k1`.

### `TypedData`

| v2 | v3 |
| --- | --- |
| `hashTypedData(definition)` | `TypedData.getSignPayload(definition)` |
| `serializeTypedData(definition)` | `TypedData.serialize(definition)` |
| `validateTypedData(definition)` | `TypedData.assert(definition)` or `TypedData.validate(definition)` |
| `getTypesForEIP712Domain({ domain })` | `TypedData.extractEip712DomainTypes(domain)` |
| `domainSeparator({ domain })` | `TypedData.domainSeparator(domain)` |
| `hashDomain({ domain, types })` | `TypedData.hashDomain({ domain, types })` |
| `hashStruct({ data, primaryType, types })` | `TypedData.hashStruct({ data, primaryType, types })` |
| `encodeType({ primaryType, types })` | `TypedData.encodeType({ primaryType, types })` |
| `recoverTypedDataAddress({ ...definition, signature })` | `Secp256k1.recoverAddress({ payload: TypedData.getSignPayload(definition), signature })` |
| `verifyTypedData({ address, ...definition, signature })` | `Secp256k1.verify({ address, payload: TypedData.getSignPayload(definition), signature })` |

### `Secp256k1`

| v2 | v3 |
| --- | --- |
| `recoverAddress({ hash, signature })` | `Secp256k1.recoverAddress({ payload: hash, signature })` |
| `recoverPublicKey({ hash, signature })` | `PublicKey.toHex(Secp256k1.recoverPublicKey({ payload: hash, signature }))` |
| `verifyHash({ address, hash, signature })` | `Secp256k1.verify({ address, payload: hash, signature })` |
| `recoverMessageAddress({ message, signature })` | `Secp256k1.recoverAddress({ payload: PersonalMessage.getSignPayload(data), signature })` |
| `verifyMessage({ address, message, signature })` | `Secp256k1.verify({ address, payload: PersonalMessage.getSignPayload(data), signature })` |
| `recoverTypedDataAddress({ ...definition, signature })` | `Secp256k1.recoverAddress({ payload: TypedData.getSignPayload(definition), signature })` |
| `verifyTypedData({ address, ...definition, signature })` | `Secp256k1.verify({ address, payload: TypedData.getSignPayload(definition), signature })` |

Direct curve helpers such as `createKeyPair`, `getPublicKey`, `sign`,
`recoverAddress`, and `verify` follow Ox naming and option shapes.

### New Utility Modules

These modules have no stable v2 utility-wrapper equivalent. Import them from
`viem/utils` or their deep module subpath.

| Module | Purpose |
| --- | --- |
| `P256` | P-256 key generation, signing, public-key recovery, and verification. |
| `PublicKey` | Structured public-key parsing, compression, and serialization. |
| `WebAuthnP256` | WebAuthn credential creation, signing, payload generation, and verification. |
| `WebCryptoP256` | Async P-256 key generation, signing, shared-secret, and verification through WebCrypto. |
