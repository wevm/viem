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
| `AbiFunction` | `ox/AbiFunction` | Exact proxy. ABI function helpers. |
| `AbiItem` | `ox/AbiItem` | Exact proxy. ABI item helpers. |
| `AbiParameters` | `ox/AbiParameters` | Exact proxy. ABI parameter encoding, decoding, formatting, and parsing. |
| `AccessList` | `ox/AccessList` | Exact proxy. Access-list construction and RPC conversion. |
| `Address` | `ox/Address` | Exact proxy. Address validation, checksum, equality, and public-key derivation. |
| `Authorization` | `ox/Authorization` | Exact proxy. EIP-7702 authorization signing and RPC conversion. |
| `Block` | `ox/Block` | Exact proxy. Block domain and RPC conversion. |
| `BlockOverrides` | `ox/BlockOverrides` | Exact proxy. Block override RPC conversion. |
| `Bytes` | `ox/Bytes` | Exact proxy. Byte-array construction, conversion, slicing, padding, and trimming. |
| `ContractAddress` | `ox/ContractAddress` | Exact proxy. CREATE and CREATE2 address derivation. |
| `Fee` | `ox/Fee` | Exact proxy. Fee history and RPC conversion. |
| `Filter` | `ox/Filter` | Exact proxy. Filter domain and RPC conversion. |
| `Hash` | `ox/Hash` | Exact proxy. Keccak, SHA-256, RIPEMD-160, HMAC-SHA256, and hash validation. |
| `Hex` | `ox/Hex` | Exact proxy. Hex construction, conversion, slicing, padding, and trimming. |
| `Log` | `ox/Log` | Exact proxy. Log domain and RPC conversion. |
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
