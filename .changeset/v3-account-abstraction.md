---
"viem": major
---

Bundler and Paymaster clients moved to `Client.create` and `PaymasterClient.create`, with custom RPC typing renamed from `rpcSchema` to `schema`.

```diff
-import { http, rpcSchema } from 'viem'
-import { createBundlerClient, createPaymasterClient } from 'viem/account-abstraction'
+import { Client, PaymasterClient, http } from 'viem/account-abstraction'
+import * as RpcSchema from 'ox/RpcSchema'

-const bundler = createBundlerClient({
-  rpcSchema: rpcSchema<[{
-    Method: 'bundler_custom'
-    Parameters: [id: string]
-    ReturnType: boolean
-  }]>(),
+const bundler = Client.create({
+  schema: RpcSchema.from<{
+    Request: { method: 'bundler_custom'; params: [id: string] }
+    ReturnType: boolean
+  }>(),
   transport: http(bundlerUrl),
 })
-const paymaster = createPaymasterClient({ transport: http(paymasterUrl) })
+const paymaster = PaymasterClient.create({ transport: http(paymasterUrl) })
```

Bundler and Paymaster runtime client types changed to `bundler` and `paymaster`, while Paymaster defaults changed to `paymaster` and `Paymaster Client`.

```diff
-bundler.type // 'bundlerClient'
-paymaster.type // 'PaymasterClient'
-paymaster.key // 'bundler'
-paymaster.name // 'Bundler Client'
+bundler.type // 'bundler'
+paymaster.type // 'paymaster'
+paymaster.key // 'paymaster'
+paymaster.name // 'Paymaster Client'
```

Standalone actions moved under `Actions`, while decorated methods moved under the `entryPoint`, `userOperation`, and `paymaster` client namespaces.

```diff
-await getSupportedEntryPoints(client)
-await prepareUserOperation(client, options)
-await estimateUserOperationGas(client, options)
-await sendUserOperation(client, options)
-await getUserOperation(client, options)
-await getUserOperationReceipt(client, options)
-await waitForUserOperationReceipt(client, options)
-await getPaymasterData(client, options)
-await getPaymasterStubData(client, options)
+await Actions.entryPoint.getSupported(client)
+await Actions.userOperation.prepare(client, options)
+await Actions.userOperation.estimateGas(client, options)
+await Actions.userOperation.send(client, options)
+await Actions.userOperation.get(client, options)
+await Actions.userOperation.getReceipt(client, options)
+await Actions.userOperation.waitForReceipt(client, options)
+await Actions.paymaster.getData(client, options)
+await Actions.paymaster.getStubData(client, options)

-await client.sendUserOperation(options)
-await client.waitForUserOperationReceipt({ hash })
-await client.getSupportedEntryPoints()
-await paymasterClient.getPaymasterData(options)
-await paymasterClient.getPaymasterStubData(options)
+await client.userOperation.send(options)
+await client.userOperation.waitForReceipt({ hash })
+await client.entryPoint.getSupported()
+await paymasterClient.paymaster.getData(options)
+await paymasterClient.paymaster.getStubData(options)
```

Bundler `getChainId` was removed in favor of the root chain action.

```diff
-const chainId = await bundlerClient.getChainId()
+import { Actions as CoreActions } from 'viem'
+const chainId = await CoreActions.chains.getId(bundlerClient)
```

`bundlerActions` became `accountAbstractionActions()`, while `paymasterActions` was replaced by the Paymaster client or standalone Paymaster actions.

```diff
-client.extend(bundlerActions)
+client.extend(accountAbstractionActions())

-client.extend(paymasterActions)
+const client = PaymasterClient.create({ transport })
+// or Actions.paymaster.getData(client, options)

-type BundlerDecorator = BundlerActions
-type PaymasterDecorator = PaymasterActions
+type BundlerDecorator = AccountAbstractionActions
+type PaymasterDecorator = PaymasterClient.Decorator
```

Smart-account constructors moved into the `SmartAccount`, `CoinbaseSmartAccount`, `SoladySmartAccount`, `Simple7702SmartAccount`, and `WebAuthnAccount` namespaces.

```diff
-toSmartAccount(implementation)
-toCoinbaseSmartAccount(options)
-toSoladySmartAccount(options)
-toSimple7702SmartAccount(options)
-toWebAuthnAccount({ credential, getFn, rpId })
+SmartAccount.from(implementation)
+CoinbaseSmartAccount.from(options)
+SoladySmartAccount.from(options)
+Simple7702SmartAccount.from(options)
+WebAuthnAccount.from(credential, { getFn, rpId })
```

Flat client and account types moved beside their namespaced factories, using `Options`, `ReturnType`, `ErrorType`, `Implementation`, and `Account` members.

```diff
-type Bundler = BundlerClient
-type BundlerOptions = BundlerClientConfig
-type BundlerError = CreateBundlerClientErrorType
-type Paymaster = PaymasterClient
-type PaymasterOptions = PaymasterClientConfig
-type PaymasterError = CreatePaymasterClientErrorType
-type Account = SmartAccount
-type AccountImplementation = SmartAccountImplementation
-type SoladyOptions = ToSoladySmartAccountParameters
-type SoladyImplementation = SoladySmartAccountImplementation
+type Bundler = Client.Client
+type BundlerOptions = Client.create.Options
+type BundlerError = Client.create.ErrorType
+type Paymaster = PaymasterClient.Client
+type PaymasterOptions = PaymasterClient.create.Options
+type PaymasterError = PaymasterClient.create.ErrorType
+type Account = SmartAccount.SmartAccount
+type AccountImplementation = SmartAccount.Implementation
+type SoladyOptions = SoladySmartAccount.from.Options
+type SoladyImplementation = SoladySmartAccount.Implementation
```

Flat action parameter, return, and error aliases moved under each action's function namespace.

```diff
-type EstimateOptions = EstimateUserOperationGasParameters
-type SupportedResult = GetSupportedEntryPointsReturnType
-type GetOptions = GetUserOperationParameters
-type GetResult = GetUserOperationReturnType
-type ReceiptOptions = GetUserOperationReceiptParameters
-type ReceiptResult = GetUserOperationReceiptReturnType
-type PrepareParameter = PrepareUserOperationParameterType
-type PrepareRequest = PrepareUserOperationRequest
-type SendOptions = SendUserOperationParameters
-type SendResult = SendUserOperationReturnType
-type SendError = SendUserOperationErrorType
-type WaitOptions = WaitForUserOperationReceiptParameters
-type PaymasterDataOptions = GetPaymasterDataParameters
-type PaymasterStubOptions = GetPaymasterStubDataParameters
+type EstimateOptions = Actions.userOperation.estimateGas.Options
+type SupportedResult = Actions.entryPoint.getSupported.ReturnType
+type GetOptions = Actions.userOperation.get.Options
+type GetResult = Actions.userOperation.get.ReturnType
+type ReceiptOptions = Actions.userOperation.getReceipt.Options
+type ReceiptResult = Actions.userOperation.getReceipt.ReturnType
+type PrepareParameter = Actions.userOperation.prepare.Parameter
+type PrepareRequest = Actions.userOperation.prepare.Options
+type SendOptions = Actions.userOperation.send.Options
+type SendResult = Actions.userOperation.send.ReturnType
+type SendError = Actions.userOperation.send.ErrorType
+type WaitOptions = Actions.userOperation.waitForReceipt.Options
+type PaymasterDataOptions = Actions.paymaster.getData.Options
+type PaymasterStubOptions = Actions.paymaster.getStubData.Options
```

WebAuthn credential creation moved to Ox, and account construction changed to `WebAuthnAccount.from(credential, options)`.

```diff
-import { createWebAuthnCredential, toWebAuthnAccount } from 'viem/account-abstraction'
+import { WebAuthnP256 } from 'ox'
+import { WebAuthnAccount } from 'viem/account-abstraction'

-const credential = await createWebAuthnCredential({ name: 'Example' })
-const owner = toWebAuthnAccount({ credential, getFn, rpId })
+const credential = await WebAuthnP256.createCredential({ name: 'Example' })
+const owner = WebAuthnAccount.from(credential, { getFn, rpId })

-type Credential = P256Credential
-type CredentialOptions = CreateWebAuthnCredentialParameters
-type CredentialResult = CreateWebAuthnCredentialReturnType
-type Owner = WebAuthnAccount
-type OwnerSignResult = WebAuthnSignReturnType
-type OwnerOptions = ToWebAuthnAccountParameters
-type OwnerResult = ToWebAuthnAccountReturnType
-type OwnerError = ToWebAuthnAccountErrorType
+type Credential = WebAuthnP256.P256Credential
+type CredentialOptions = WebAuthnP256.createCredential.Options
+type CredentialResult = WebAuthnP256.P256Credential
+type Owner = WebAuthnAccount.Account
+type OwnerSignResult = WebAuthnAccount.SignReturnType
+type OwnerCredential = WebAuthnAccount.from.Credential
+type OwnerOptions = WebAuthnAccount.from.Options
+type OwnerResult = WebAuthnAccount.from.ReturnType
+type OwnerError = WebAuthnAccount.from.ErrorType
```

WebAuthn credentials adopted Ox's structured P256 keys and immediate validation, with `Credential.serialize` replacing direct public-key persistence.

```diff
-const stored = JSON.stringify(credential.publicKey)
+import { Credential } from 'ox/webauthn'
+const stored = JSON.stringify(Credential.serialize(credential))
```

EntryPoint constants and UserOperation utilities moved into the Ox-backed `EntryPoint`, `UserOperation`, `UserOperationGas`, and `UserOperationReceipt` namespaces.

```diff
-entryPoint06Abi
-entryPoint06Address
-entryPoint07Abi
-entryPoint07Address
-entryPoint08Abi
-entryPoint08Address
-entryPoint09Abi
-entryPoint09Address
-getUserOperationHash({ userOperation: operation, ...options })
-getUserOperationTypedData({ userOperation: operation, ...options })
-toPackedUserOperation(operation, options)
-getInitCode(operation, options)
-toUserOperation(operation)
-formatUserOperation(operation)
-formatUserOperationRequest(operation)
-formatUserOperationGas(gas)
-formatUserOperationReceipt(receipt)
+EntryPoint.abiV06
+EntryPoint.addressV06
+EntryPoint.abiV07
+EntryPoint.addressV07
+EntryPoint.abiV08
+EntryPoint.addressV08
+EntryPoint.abiV09
+EntryPoint.addressV09
+UserOperation.hash(operation, options)
+UserOperation.toTypedData(operation, options)
+UserOperation.toPacked(operation, options)
+UserOperation.toInitCode(operation)
+UserOperation.from(operation)
+UserOperation.fromRpc(operation)
+UserOperation.toRpc(operation)
+UserOperationGas.fromRpc(gas)
+UserOperationReceipt.fromRpc(receipt)
```

User-operation and RPC types moved into their corresponding primitive namespaces.

```diff
-type Version = EntryPointVersion
-type Operation = UserOperation
-type RpcOperation = RpcUserOperation
-type Packed = PackedUserOperation
-type Gas = RpcEstimateUserOperationGasReturnType
-type RpcTransaction = RpcGetUserOperationByHashReturnType
-type Receipt = UserOperationReceipt
-type RpcReceipt = RpcUserOperationReceipt
-type RpcRequest = RpcUserOperationRequest
+type Version = EntryPoint.Version
+type Operation = UserOperation.UserOperation
+type RpcOperation = UserOperation.Rpc
+type Packed = UserOperation.Packed
+type Gas = UserOperationGas.Rpc
+type RpcTransaction = UserOperation.RpcTransactionInfo
+type Receipt = UserOperationReceipt.UserOperationReceipt
+type RpcReceipt = UserOperationReceipt.Rpc
+// No public partial RPC request type; use `UserOperation.Request` for native input.
```

`UserOperationRequest` became `UserOperation.Request`, with partially preparable fields and mutually exclusive `calls` or `callData` inputs.

```diff
-import type { UserOperationRequest } from 'viem/account-abstraction'
+import type { UserOperation } from 'viem/account-abstraction'

-type Request = UserOperationRequest
+type Request = UserOperation.Request

-const request = { callData, calls }
+const request = { calls }
+// or: const request = { callData }
```

User-operation generics gained an explicit signed parameter, while receipt generics began accepting a full receipt type instead of a status type.

```diff
-type Operation = UserOperation<'0.8', bigint, number>
-type Receipt = UserOperationReceipt<'0.8', bigint, number, 'success'>
+type Operation = UserOperation.UserOperation<'0.8', true, bigint, number>
+type Receipt = UserOperationReceipt.UserOperationReceipt<
+  '0.8',
+  bigint,
+  number,
+  CustomReceipt
+>
```

EIP-7702 authorization became limited to EntryPoint 0.8 and 0.9, and unsigned native operations began permitting an omitted signature.

```diff
-type Operation = UserOperation<'0.6'> & { authorization?: Authorization }
+type Operation = UserOperation.UserOperation<'0.8', false>
+// `authorization` is available and `signature` is optional.
```

`UserOperation.toPacked` dropped EntryPoint 0.6 inputs, and `UserOperation.toInitCode` removed `forHash` while always normalizing EIP-7702 delegation init code.

```diff
-toPackedUserOperation(operation06)
+UserOperation.toPacked(operation07)

-getInitCode(operation, { forHash: true })
+UserOperation.toInitCode(operation)
```

Bundler and Paymaster actions became EntryPoint-version-aware, with EntryPoint 0.9 results preserving `paymasterSignature`.

```diff
-const data = await getPaymasterData(client, options)
+const data = await Actions.paymaster.getData<'0.9'>(client, options)
+data.paymasterSignature
```

Bundler Paymaster hooks were renamed to `getData` and `getStubData`, and full `PaymasterClient.Client` values became accepted.

```diff
 const bundler = Client.create({
-  paymaster: { getPaymasterData, getPaymasterStubData },
+  paymaster: { getData, getStubData },
+  // or: paymaster: PaymasterClient.create({ transport }),
   transport,
 })
```

Pending User Operation lookups made `blockHash`, `blockNumber`, and `transactionHash` nullable.

```diff
-result.blockHash: Hex
-result.blockNumber: bigint
-result.transactionHash: Hex
+result.blockHash: Hex | null
+result.blockNumber: bigint | null
+result.transactionHash: Hex | null
```

Smart-account methods began accepting synchronous results, while resolved accounts stopped exposing configuration-only `extend` and `nonceKeyManager` members.

```diff
-account.encodeCalls(calls).then(useCallData)
+useCallData(await account.encodeCalls(calls))

-account.extend
-account.nonceKeyManager
```

Generic smart accounts stopped advertising `sign` unless implemented and left the core `Account.Account` union.

```diff
-import type { Account } from 'viem'
-function submit(account: Account) {}
+import type { SmartAccount } from 'viem/account-abstraction'
+function submit(account: SmartAccount.SmartAccount) {}
```

Solady accounts restricted EntryPoint versions to 0.6 and 0.7, required `factoryAddress` with explicit EntryPoints, and returned version-specific ABIs.

```diff
-const account = await toSoladySmartAccount({ client, entryPoint, owner })
+const account = await SoladySmartAccount.from({
+  client,
+  entryPoint,
+  factoryAddress,
+  owner,
+})
```

Coinbase accounts began rejecting empty owner lists during construction.

```diff
-const account = await toCoinbaseSmartAccount({ ...options, owners: [] })
+const account = await CoinbaseSmartAccount.from({ ...options, owners })
+// `owners` must contain at least one owner.
```

Custom preparation hooks began receiving version-specific partial operations instead of the broad `UserOperationRequest` type.

```diff
-estimateFeesPerGas({ userOperation: request as UserOperationRequest })
-getStubSignature(request as UserOperationRequest)
+estimateFeesPerGas({ userOperation: operation as Partial<UserOperation.UserOperation> })
+getStubSignature(operation)
```

Error classes remained flat, while their `*ErrorType` aliases were removed and action or conversion errors moved under function namespaces.

```diff
-type SendError = SendUserOperationErrorType
-type ExecutionError = UserOperationExecutionErrorType
-type FormatError = FormatUserOperationErrorType
+type SendError = Actions.userOperation.send.ErrorType
+type ExecutionError = UserOperationExecutionError
+type FormatError = UserOperation.fromRpc.ErrorType
```

Utility option, return, and formatter error aliases without namespace equivalents were removed in favor of direct inputs and inference.

```diff
-type HashResult = GetUserOperationHashReturnType
-type TypedDataResult = GetUserOperationTypedDataReturnType
-type InitCodeOptions = GetInitCodeOptions
-type GasFormatError = FormatUserOperationGasErrorType
+type HashResult = ReturnType<typeof UserOperation.hash>
+type TypedDataResult = ReturnType<typeof UserOperation.toTypedData>
+// `UserOperation.toInitCode` has no options.
```

Bundler error normalization helpers and generic inference helpers were removed from the public API.

```diff
-getBundlerError(...)
-getUserOperationError(...)
-type Account = DeriveSmartAccount<client, account>
-type AccountParameter = GetSmartAccountParameter<client, account>
-type Version = DeriveEntryPointVersion<account>
-type VersionParameter = GetEntryPointVersionParameter<version>
+// Error normalization is internal.
+type Account = SmartAccount.SmartAccount
+type Version = EntryPoint.Version
```

The standalone `viem/experimental/erc7739` entrypoint was removed, while Solady accounts retained ERC-7739 message and typed-data signing internally.

```diff
-import { erc7739Actions, signMessage, signTypedData } from 'viem/experimental/erc7739'
+import { SoladySmartAccount } from 'viem/account-abstraction'

-client.extend(erc7739Actions())
+const account = await SoladySmartAccount.from(options)
+await account.signMessage({ message })
+await account.signTypedData(typedData)
```
