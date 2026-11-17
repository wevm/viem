# viem

## 3.0.0-next.15

### Patch Changes

- [#5411](https://github.com/wevm/viem/pull/5411) [`3708ffc`](https://github.com/wevm/viem/commit/3708ffc3fc8ec0a957a577970da87903811cf649) Thanks [@jxom](https://github.com/jxom)! - `viem/tempo`: Removed the `getKey` read before transactions from an access key with a pending key authorization, retrying the fill without the authorization when the chain has already registered the key.

- [#5310](https://github.com/wevm/viem/pull/5310) [`7e015cb`](https://github.com/wevm/viem/commit/7e015cb1d72e6b54e4468d7dd60aa59a51fe8d9b) Thanks [@BaronOdon](https://github.com/BaronOdon)! - Added Molibra chain.

- [#5321](https://github.com/wevm/viem/pull/5321) [`af06257`](https://github.com/wevm/viem/commit/af062571382ec3631cf1901aeda9b58a87c8fad5) Thanks [@evanaronson](https://github.com/evanaronson)! - Removed a trailing slash from the ZKsync explorer URL.

- [#5358](https://github.com/wevm/viem/pull/5358) [`179a536`](https://github.com/wevm/viem/commit/179a53682d9bf2ac2b7a65a86ec312fca0c7c9a8) Thanks [@Turkchain1919](https://github.com/Turkchain1919)! - Added Turkchain Mainnet (Chain ID: 1919) to the supported chains.

- [#4930](https://github.com/wevm/viem/pull/4930) [`06a865a`](https://github.com/wevm/viem/commit/06a865a944a511bae376970f6dd69a1bd577fa34) Thanks [@jxom](https://github.com/jxom)! - Fixed `Actions.event.getLogs`, `Actions.event.watch`, `Actions.event.createFilter`, `Actions.filter.getChanges`, `Actions.filter.getLogs`, and the contract event actions never decoding anonymous event logs, which are now decoded when every requested event is anonymous (such as a single anonymous `event` or `eventName`), and fixed an anonymous event in `events` producing an invalid topic filter.

- [#5274](https://github.com/wevm/viem/pull/5274) [`bea62b1`](https://github.com/wevm/viem/commit/bea62b141a437cfd4027be182e94ae9b7a56fcf1) Thanks [@mmv08](https://github.com/mmv08)! - Changed the default `cacheTime` to the shorter of `pollingInterval` and half of `chain.blockTime`, so block numbers are cached for at most half a block.

- [#5253](https://github.com/wevm/viem/pull/5253) [`94e5c08`](https://github.com/wevm/viem/commit/94e5c08e73f3627f3b99660d4498344f976707c2) Thanks [@decofe](https://github.com/decofe)! - Increased the base fee multiplier to 2 for HyperEVM mainnet and testnet to provide more headroom for fee increases.

- [#5364](https://github.com/wevm/viem/pull/5364) [`8f2a79b`](https://github.com/wevm/viem/commit/8f2a79ba8b4d235a24c4c101f4ef04a824c3e429) Thanks [@jxom](https://github.com/jxom)! - Changed CCIP Read lookups to apply the Client transport timeout (the longest of a `fallback`'s transports) to gateway requests and to share one budget of 256 gateway requests (one per URL) and 16 concurrent requests across a lookup's callbacks and nested local batches.

- [#4930](https://github.com/wevm/viem/pull/4930) [`06a865a`](https://github.com/wevm/viem/commit/06a865a944a511bae376970f6dd69a1bd577fa34) Thanks [@jxom](https://github.com/jxom)! - Fixed `Chain.ExtractBlock` for chains with a block codec, such as Tempo and OP Stack, to narrow `transactions` on `includeTransactions` and the hash, logs bloom, nonce, and number on a `'pending'` `blockTag`.

- [#5258](https://github.com/wevm/viem/pull/5258) [`13c0386`](https://github.com/wevm/viem/commit/13c03860b3688153af22368ba42709955880edfc) Thanks [@jxom](https://github.com/jxom)! - Added `client.scope` for creating a Client, memoized per `signal`, that does not share in-flight requests, cached values, or request batches with other Clients.

  ```ts
  const scoped = client.scope({ signal: request.signal });
  const blockNumber = await Actions.block.getNumber(scoped);
  ```

- Fixed `Actions.ens.getAvatar` failing on inline SVGs and base64 NFT metadata with non-ASCII characters or line breaks, and substituting decimal ERC-1155 token IDs into `{id}` metadata URIs instead of 64-character hex.

- [#5360](https://github.com/wevm/viem/pull/5360) [`41801d8`](https://github.com/wevm/viem/commit/41801d827e339b96d1b4dd775f4dd379f17cc610) Thanks [@jxom](https://github.com/jxom)! - `viem/tempo`: Raised the default expiring nonce `validBefore` from 25 to 270 seconds, capped `Relay.feePayer` expiring nonce windows at 300 seconds, added `Expiry.expiringNonceMax`, and replaced the random expiring nonce `validAfter` with a random `nonce` discriminator.

- [#5360](https://github.com/wevm/viem/pull/5360) [`41801d8`](https://github.com/wevm/viem/commit/41801d827e339b96d1b4dd775f4dd379f17cc610) Thanks [@jxom](https://github.com/jxom)! - Fixed sponsored `Actions.transaction.prepare` fills keeping a requested `feeToken` (and validity bounds) that the fee payer did not sign, which made the fee payer signature invalid.

- [#5411](https://github.com/wevm/viem/pull/5411) [`3708ffc`](https://github.com/wevm/viem/commit/3708ffc3fc8ec0a957a577970da87903811cf649) Thanks [@jxom](https://github.com/jxom)! - Added an `afterFillTransactionError` phase to chain `transaction.prepare` hooks that receives the fill error and retries `eth_fillTransaction` once with the request the hook returns.

- [#5378](https://github.com/wevm/viem/pull/5378) [`cbdd610`](https://github.com/wevm/viem/commit/cbdd61078378012368464c9b0e4a76804a5ea987) Thanks [@mmv08](https://github.com/mmv08)! - Fixed `transaction.fill` returning `gasPrice` next to EIP-1559 fees on Anvil, which Geth, reth, and Anvil 1.8.5 and later reject when sent back with "both gasPrice and (maxFeePerGas or maxPriorityFeePerGas) specified".

- [#5298](https://github.com/wevm/viem/pull/5298) [`a69e96c`](https://github.com/wevm/viem/commit/a69e96c8e89cc0398a6b918c392e24e3b615bee0) Thanks [@jxom](https://github.com/jxom)! - Fixed OP Stack `Actions.l1.getTimeToFinalize` ignoring the resolution and finality delay of the proof's dispute game.

- [#5282](https://github.com/wevm/viem/pull/5282) [`52140fe`](https://github.com/wevm/viem/commit/52140fef00389781737477de205f82f71553b3c3) Thanks [@jxom](https://github.com/jxom)! - Fixed `http` transport batches and `RpcClient.http` batch requests mishandling a server that rejected the whole batch with a single error or returned fewer responses than requests.

- [#5389](https://github.com/wevm/viem/pull/5389) [`5a7ec09`](https://github.com/wevm/viem/commit/5a7ec0946af3936eb13b9cd5ad6b4bc0ee7f3f08) Thanks [@mortezashojaei](https://github.com/mortezashojaei)! - Fixed `http` transport batches using another transport's authorization headers and request configuration.

- [#5404](https://github.com/wevm/viem/pull/5404) [`39d9b10`](https://github.com/wevm/viem/commit/39d9b10798bc29d387f4948fa7fd95484e7e607c) Thanks [@jxom](https://github.com/jxom)! - Fixed the `http` transport and `RpcClient.http` dropping `fetchOptions.headers` supplied as `Headers` instances or tuple arrays.

- [#5286](https://github.com/wevm/viem/pull/5286) [`8e058ca`](https://github.com/wevm/viem/commit/8e058ca71bf09c85d2a4669af5e98aeb5bc87e71) Thanks [@jxom](https://github.com/jxom)! - Fixed the `http` transport, including under the `fallback` transport, to retry JSON-RPC errors from non-2xx responses by their HTTP status and `Retry-After` header, added `rpcError` to `RpcClient.HttpError` for those responses, and set that `RpcClient.HttpError` (with its `status` and `headers`) as the `cause` of the JSON-RPC error they surface as.

- [#5346](https://github.com/wevm/viem/pull/5346) [`7156f80`](https://github.com/wevm/viem/commit/7156f80f77c47c0a3f9df479b0a6e856029edb3b) Thanks [@KieranAltman](https://github.com/KieranAltman)! - Updated HashKey Chain and HashKey Chain Testnet display names, native currency name, and block explorer URLs.

- [#5392](https://github.com/wevm/viem/pull/5392) [`9348d38`](https://github.com/wevm/viem/commit/9348d386a9f62fd6713124e25360d6040e4a34cf) Thanks [@gakonst](https://github.com/gakonst)! - Stopped retrying JSON-RPC method-not-found (`-32601`) and method-not-supported (`-32004`) errors from non-2xx HTTP responses, since a retry gets the same refusal.

- [#5273](https://github.com/wevm/viem/pull/5273) [`ef92315`](https://github.com/wevm/viem/commit/ef92315ab2139aee63f9222634109f5bb48c69e8) Thanks [@mmv08](https://github.com/mmv08)! - Updated `monad` and `monadTestnet` `blockTime` to 300 ms.

- [#5373](https://github.com/wevm/viem/pull/5373) [`ddc2d36`](https://github.com/wevm/viem/commit/ddc2d365d093793f9d8f5818743f169c98eed8d7) Thanks [@jxom](https://github.com/jxom)! - Added an optional `nonce` to `NonceManager` `reset` parameters, which `Actions.transaction.send` and `Actions.transaction.sendSync` now set to the consumed nonce when a send fails after `consume` returned.

- [#5303](https://github.com/wevm/viem/pull/5303) [`d10dc3c`](https://github.com/wevm/viem/commit/d10dc3c203c63ec42abc2cd392fb7de4562cb591) Thanks [@jxom](https://github.com/jxom)! - Mapped `OutOfFunds` node errors to `RpcError.InsufficientFundsError`.

- [#4930](https://github.com/wevm/viem/pull/4930) [`06a865a`](https://github.com/wevm/viem/commit/06a865a944a511bae376970f6dd69a1bd577fa34) Thanks [@jxom](https://github.com/jxom)! - Updated `ox` to `1.8.13`, which resolves contract function overloads by array length and integer or fixed-bytes range (throwing `AbiItem.AmbiguityError` for indistinguishable overloads), matches `event.getLogs` `args` filters on `bytes` values in any hex case and on non-indexed `string` and `bytes` values, rejects out-of-range integer and dirty `address` words in decoded ABI data, adds an `even` option to `Hex.assert` and `Hex.validate`, rejects invalid EIP-712 struct names and field types with `TypedData.InvalidStructTypeError` and `TypedData.InvalidTypeError` (replacing `TypedData.InvalidTypedDataTypeError`) and keeps an empty `EIP712Domain` `version`, accepts punycode top-level domains in `Siwe.createMessage`, rejects a `maxPriorityFeePerGas` above a zero `maxFeePerGas` when asserting or deserializing transaction envelopes, parses and serializes EIP-7702 authorizations with a `yParity` above 1, and pads short `r` and `s` values in `Signature.toHex` and `Signature.toBytes`.

- [#5371](https://github.com/wevm/viem/pull/5371) [`035c519`](https://github.com/wevm/viem/commit/035c519b6b6b3f179fa741953751a501f05132a2) Thanks [@jxom](https://github.com/jxom)! - Made `Authorization.verify` return `false` for an EIP-7702 authorization with a `yParity` other than 0 or 1, which EIP-7702 treats as having no authority.

- [#5431](https://github.com/wevm/viem/pull/5431) [`8b040a3`](https://github.com/wevm/viem/commit/8b040a3542cd3527b3c73941c9924cae42cea748) Thanks [@jxom](https://github.com/jxom)! - Fixed the ERC-4337 `Actions.userOperation.prepare` replacing a falsy per-operation `paymasterContext` (`false`, `0`, `''`, or `null`) with the Bundler Client's default `paymasterContext`.

- [#5284](https://github.com/wevm/viem/pull/5284) [`b3e3947`](https://github.com/wevm/viem/commit/b3e39473523d7be57ec5f35f51cb416f16b6cbd2) Thanks [@jxom](https://github.com/jxom)! - Added a `replacement` option to `Actions.transaction.waitForReceipt` that looks up a dropped transaction by sender and nonce to detect its replacement, and made the wait call `onReplaced` for a replacement found while it waits for more confirmations.

- [#5406](https://github.com/wevm/viem/pull/5406) [`bb7c12c`](https://github.com/wevm/viem/commit/bb7c12c7514f5a2856c476a4df59ce6489af348f) Thanks [@jxom](https://github.com/jxom)! - Fixed `transaction.waitForReceipt` returning a discarded receipt after a reorg while waiting for confirmations.

- [#5443](https://github.com/wevm/viem/pull/5443) [`bb4662f`](https://github.com/wevm/viem/commit/bb4662fdb1aaa3194f20ccf6d8a3ea42466348e0) Thanks [@jxom](https://github.com/jxom)! - Added a `signal` option to `transaction.waitForReceipt` that stops the wait, rejecting `receipt` with the signal's reason.

- [#5314](https://github.com/wevm/viem/pull/5314) [`c0d52cd`](https://github.com/wevm/viem/commit/c0d52cdcb262744a64e742e4cf891cbbde9ccdc9) Thanks [@jxom](https://github.com/jxom)! - `viem/tempo`: Keyed `Relay.accounts` configs by chain and added a `resolveConfig` option for configs the store does not hold.

- [#5356](https://github.com/wevm/viem/pull/5356) [`51b4392`](https://github.com/wevm/viem/commit/51b4392225161440bf29643e2fbced31c35cfa7a) Thanks [@jxom](https://github.com/jxom)! - `viem/tempo`: Added `Relay.autoSwap`, which recovers `InsufficientBalance` fills that opt in with `capabilities.autoSwap` by prepending a stablecoin DEX buy of the missing amount.

- `viem/tempo`: Changed `Relay.simulate` to return `balanceDiffs` only for requests with `capabilities.balanceDiffs: true`, report same-token incoming and outgoing transfers separately, measure approval exposure as the allowance left after the calls, and read ERC-20 metadata for non-TIP-20 tokens.

- [#5392](https://github.com/wevm/viem/pull/5392) [`9348d38`](https://github.com/wevm/viem/commit/9348d386a9f62fd6713124e25360d6040e4a34cf) Thanks [@gakonst](https://github.com/gakonst)! - Reduced per-request overhead of `RpcClient.http` and `RpcClient.webSocket` (and the `http` and `webSocket` transports) by building the `onRequest` `Request` only when the hook is set and the `TimeoutError` only when a request times out.

- [#5288](https://github.com/wevm/viem/pull/5288) [`75ffe81`](https://github.com/wevm/viem/commit/75ffe81d29d85bee3b895a5d7ae612675b625ee8) Thanks [@jxom](https://github.com/jxom)! - Fixed request retries firing immediately for `Retry-After` headers in HTTP-date form or for delays longer than the 24.8-day timer limit.

- [#5241](https://github.com/wevm/viem/pull/5241) [`da50caa`](https://github.com/wevm/viem/commit/da50caabd9df56fb0a4a6d8e71d28325a806cb36) Thanks [@ksrr9351](https://github.com/ksrr9351)! - Added RWA Chain and RWA Chain Sepolia chains.

- [#5301](https://github.com/wevm/viem/pull/5301) [`efda1c4`](https://github.com/wevm/viem/commit/efda1c43147b85fdde5a9d5b88c4ffd5a9262073) Thanks [@jxom](https://github.com/jxom)! - Fixed `Actions.wallet.sendCalls` dropping a call's `dataSuffix` when the call has no `data`.

- [#5306](https://github.com/wevm/viem/pull/5306) [`30833ec`](https://github.com/wevm/viem/commit/30833eca2ef352e2af34f577964b633823acc999) Thanks [@jxom](https://github.com/jxom)! - Fixed importing `viem`, `viem/chains`, `viem/tempo`, and other entrypoints under SES `lockdown()`, which threw `Cannot assign to read only property 'call'`.

- Fixed `SignatureErc2098.toSignature` returning an unpadded `r`, and `SignatureErc2098.from` silently corrupting signatures with a high `s` or a `yParity` other than `0` or `1`, which now throw `SignatureErc2098.InvalidSError` and `Signature.InvalidYParityError`.

- [#5302](https://github.com/wevm/viem/pull/5302) [`c42c189`](https://github.com/wevm/viem/commit/c42c189ee8fe1b0183b6abf1b00a58f134ea2b57) Thanks [@jxom](https://github.com/jxom)! - Fixed OP Stack `Actions.l1.getWithdrawalStatus`, `Actions.l1.getTimeToProve`, and `Actions.l1.waitToProve` matching super-root games against the L2 block number instead of the withdrawal's L2 timestamp, which they now read from the receipt logs' `blockTimestamp` (or throw `Withdrawal.L2TimestampRequiredError`).

- [#5377](https://github.com/wevm/viem/pull/5377) [`42c41ca`](https://github.com/wevm/viem/commit/42c41ca3c42792e56a2e1f64d3007c28adc9fbba) Thanks [@mmv08](https://github.com/mmv08)! - Fixed `transaction.sendSync` and `contract.writeSync` failing at once and freeing the nonce when the node had accepted the transaction but stopped waiting for its receipt (`eth_sendRawTransactionSync` error code 4), even if the error had no transaction hash, and stopped `fallback` from sending that transaction to the next node.

- [#5401](https://github.com/wevm/viem/pull/5401) [`1d45769`](https://github.com/wevm/viem/commit/1d457699c28d19e8f239c1201132adbe3c47fe0c) Thanks [@jxom](https://github.com/jxom)! - `viem/tempo`: Marked the aggregate `Abis` exports (`core`, `earn`, `zone`, `propAmm`, `all`) as pure so bundlers drop the ABIs a consumer does not import.

- [#5388](https://github.com/wevm/viem/pull/5388) [`141f8c0`](https://github.com/wevm/viem/commit/141f8c0ed7f5fdeafbfc514131781638e9340bd9) Thanks [@jxom](https://github.com/jxom)! - Added `Account.serialize` and `Account.deserialize` to `viem/tempo`, which store a configurable account (TIP-1107) as JSON and rebuild it with passkey owners that sign, `Account.AddressMismatchError` for a version-zero config that does not derive the stored address, and a `keyAuthorization` option to access key accounts that attaches a signed key authorization to the account's transactions until the chain registers the access key.

- [#4930](https://github.com/wevm/viem/pull/4930) [`06a865a`](https://github.com/wevm/viem/commit/06a865a944a511bae376970f6dd69a1bd577fa34) Thanks [@jxom](https://github.com/jxom)! - `viem/tempo`: Removed admin access keys, which T14 (TIP-1137) retires: the `admin` option on key authorizations, `Actions.accessKey.isAdmin`, and `Actions.accessKey.watchAdminAuthorized`, so access keys no longer sign key authorizations.

- [#5408](https://github.com/wevm/viem/pull/5408) [`7585a54`](https://github.com/wevm/viem/commit/7585a54228fa66d476969029a943afcbf30a8aeb) Thanks [@jxom](https://github.com/jxom)! - `viem/tempo`: Renamed the `UpgradeMustBeOnlyCall` error to `UpgradeMustBeDirectCall` and added `Abis.configurableAccountShim` (`isValidSignature`, `onERC721Received`) for registered configurable accounts.

- [#5408](https://github.com/wevm/viem/pull/5408) [`7585a54`](https://github.com/wevm/viem/commit/7585a54228fa66d476969029a943afcbf30a8aeb) Thanks [@jxom](https://github.com/jxom)! - `viem/tempo`: Added `keyAuthorizationSimulation` to Tempo transaction requests, filled during preparation while a configurable account's key authorization lacks its owner quorum.

- [#5408](https://github.com/wevm/viem/pull/5408) [`7585a54`](https://github.com/wevm/viem/commit/7585a54228fa66d476969029a943afcbf30a8aeb) Thanks [@jxom](https://github.com/jxom)! - `viem/tempo`: Changed `verifyHash` with `mode: 'allowAccessKey'` to verify configurable access keys and to reject retired root keys and inner signatures that do not match the stored key type.

- [#5408](https://github.com/wevm/viem/pull/5408) [`7585a54`](https://github.com/wevm/viem/commit/7585a54228fa66d476969029a943afcbf30a8aeb) Thanks [@jxom](https://github.com/jxom)! - `viem/tempo`: Added an `access` option to `Account.fromConfig` so a configurable account can sign as an access key of another account (TIP-1111), with keychain envelopes the relay fee payer accepts.

- `viem/tempo`: Added `Actions.accounts.deriveAccount`, `Actions.accounts.upgrade`, `Actions.accounts.upgradeSync`, and `Actions.accounts.verifyHash` for Tempo T14 configurable accounts, added the `upgrade` form of `Account.fromConfig` for accounts upgraded in place, cached configs installed by account upgrades in `Relay.accounts`, and renamed the `nativeMultisig` ABI, address, and selector exports to `configurableAccount`.

- [#4930](https://github.com/wevm/viem/pull/4930) [`06a865a`](https://github.com/wevm/viem/commit/06a865a944a511bae376970f6dd69a1bd577fa34) Thanks [@jxom](https://github.com/jxom)! - `viem/tempo`: Derived configurable account addresses from the initial config hash instead of a recovery factory (tempoxyz/tempo#8595), so `Addresses.nativeMultisigFactory` was removed.

- [#5332](https://github.com/wevm/viem/pull/5332) [`de39e10`](https://github.com/wevm/viem/commit/de39e106022f313a16c3b7367d8330753748c516) Thanks [@jxom](https://github.com/jxom)! - `viem/tempo`: Added `signMessage` and `signTypedData` support to `Account.fromConfig` configurable accounts, which sign the EIP-191 or EIP-712 digest with the same configurable signature envelope as `sign`.

- [#4930](https://github.com/wevm/viem/pull/4930) [`d5cac0a`](https://github.com/wevm/viem/commit/d5cac0ad0f5e4c41f0e8d5ae1d52405b6a1195ca) Thanks [@jxom](https://github.com/jxom)! - `viem/tempo`: Fixed configurable accounts signing the unsponsored payload for a `feePayer: true` request.

- [#5408](https://github.com/wevm/viem/pull/5408) [`7585a54`](https://github.com/wevm/viem/commit/7585a54228fa66d476969029a943afcbf30a8aeb) Thanks [@jxom](https://github.com/jxom)! - `viem/tempo`: Fixed `Actions.accounts.updateConfigSync` returning the version-0 registration config instead of the installed config on an account's first transaction.

- [#5408](https://github.com/wevm/viem/pull/5408) [`7585a54`](https://github.com/wevm/viem/commit/7585a54228fa66d476969029a943afcbf30a8aeb) Thanks [@jxom](https://github.com/jxom)! - `viem/tempo`: Allowed `keyAuthorization` in `Actions.accounts.upgrade` and `upgradeSync`, and made the accounts relay cache configs from upgrades anywhere in a batch, matching TIP-1113.

- [#5228](https://github.com/wevm/viem/pull/5228) [`b86b380`](https://github.com/wevm/viem/commit/b86b380b55928d6c5785cef1ddc9adf595fbe078) Thanks [@jxom](https://github.com/jxom)! - `viem/tempo`: Added typed `TempoExecutionError` errors to Tempo actions, with per-namespace subclasses (such as `Actions.accessKey.AccessKeySpendingLimitExceededError`) carrying decoded arguments, fetched onchain details, and resolution hints.

- [#4930](https://github.com/wevm/viem/pull/4930) [`06a865a`](https://github.com/wevm/viem/commit/06a865a944a511bae376970f6dd69a1bd577fa34) Thanks [@jxom](https://github.com/jxom)! - `viem/tempo`: Fixed `Account.signTransaction` signing the unsponsored payload for a `feePayer` request passed without the `feePayerSignature: null` marker, and serializing a prefilled fee payer signature into the fee payer handoff format.

- [#5391](https://github.com/wevm/viem/pull/5391) [`721d682`](https://github.com/wevm/viem/commit/721d6824516514195c0a98971731c6d81b2f9032) Thanks [@jxom](https://github.com/jxom)! - `viem/tempo`: Added experimental `Gateway` and `gatewayActions` (`client.ai`, `client.bucket`, `client.compute`, `client.gateway`, `client.kv`), with standalone `Actions.ai`, `Actions.bucket`, `Actions.compute`, `Actions.gateway`, and `Actions.kv`, for wallet-paid inference, object storage, metered CPU and GPU compute, and key-value state on a Tempo Gateway.

- [#5260](https://github.com/wevm/viem/pull/5260) [`b56592f`](https://github.com/wevm/viem/commit/b56592f7b6cc2d01d926bf6cf278d53cbc0b6e17) Thanks [@jxom](https://github.com/jxom)! - `viem/tempo`: Added Tempo hardforks `t7` through `t14`, `Addresses.ousd`, and the `configurable` key type in `Actions.accessKey.getMetadata`, and changed `Hardfork.lt` to treat unknown hardforks as newer than every known hardfork.

- [#5405](https://github.com/wevm/viem/pull/5405) [`828d396`](https://github.com/wevm/viem/commit/828d3964bf1bbf72f438f0942aee0dd760eabe1a) Thanks [@gakonst](https://github.com/gakonst)! - Added the Multicall3 that Tempo Mainnet, Moderato and Devnet deploy at genesis to `tempo`, `tempoModerato` and `tempoDevnet`, so their clients batch and `multicall` through it instead of needing `deployless`.

- `viem/tempo`: Filled the protocol nonce for `nonceKey: 0n`, decoded Tempo transactions inside blocks (keeping expiring nonces above `Number.MAX_SAFE_INTEGER` exact), and made `Actions.transaction.waitForReceipt` detect replacements per Tempo nonce slot through a new `chain.transaction.replacement` hook.

- [#4930](https://github.com/wevm/viem/pull/4930) [`d5cac0a`](https://github.com/wevm/viem/commit/d5cac0ad0f5e4c41f0e8d5ae1d52405b6a1195ca) Thanks [@jxom](https://github.com/jxom)! - `viem/tempo`: Typed the relay-filled `validAfter` and `validBefore` bounds on the request returned by `Actions.transaction.prepare`.

- [#4930](https://github.com/wevm/viem/pull/4930) [`06a865a`](https://github.com/wevm/viem/commit/06a865a944a511bae376970f6dd69a1bd577fa34) Thanks [@jxom](https://github.com/jxom)! - `viem/tempo`: Fixed `Relay.feePayer` co-signing the fill of a configurable account transaction instead of deferring sponsorship to broadcast, and `withRelay` sending fee-payer-format configurable account transactions to `eth_signRawTransaction` instead of the relay.

- [#5236](https://github.com/wevm/viem/pull/5236) [`72950dd`](https://github.com/wevm/viem/commit/72950dd9442df72fbcb78a3949a778c9bfc78f8d) Thanks [@jxom](https://github.com/jxom)! - `viem/tempo`: Hardened `Relay.feePayer` sponsorship by recovering raw senders from their signatures, rejecting non-canonical envelopes, bounding returned signatures by `validity`, accepting a per-chain `feeToken` resolver, adding `minimumBaseFee` and `onRejected` for base-fee rejections, adding `feePayer` to `SponsoredEvent`, estimating sponsored fills without the sender's fee caps, and capping Relay request bodies at 16 MiB.

- [#4930](https://github.com/wevm/viem/pull/4930) [`d5cac0a`](https://github.com/wevm/viem/commit/d5cac0ad0f5e4c41f0e8d5ae1d52405b6a1195ca) Thanks [@jxom](https://github.com/jxom)! - `viem/tempo`: Exported the `RelayTransport` type that `withRelay` returns for a remote relay.

- `viem/tempo`: Reserved 5,000 gas for the fee payer's signature and fee token on sponsored requests, kept the gas of owner-approved configurable account requests, and verified configurable account signatures in `verifyHash`.

- [#5442](https://github.com/wevm/viem/pull/5442) [`a960ce1`](https://github.com/wevm/viem/commit/a960ce1a524d3e14066f73a1b0daeea8a4abc49b) Thanks [@jxom](https://github.com/jxom)! - Fixed `Actions.ens.getAddress` to resolve leading-zero EVM addresses and return `null` for the zero address instead of throwing when an offchain resolver returned an address-encoded response for an Ethereum or EVM chain `coinType`.

- [#5318](https://github.com/wevm/viem/pull/5318) [`57db085`](https://github.com/wevm/viem/commit/57db085e896dfee3a3387fb7573bf7f7ebc6170d) Thanks [@jxom](https://github.com/jxom)! - Fixed `maxPriorityFeePerGas` above a `maxFeePerGas` of `0n` not raising `RpcError.TipAboveFeeCapError` or `TransactionPrepare.MaxFeePerGasTooLowError` in actions that validate requests before calling the node (such as `Actions.call`, `Actions.transaction.estimateGas` and `Actions.transaction.send`), and fixed fee error messages dropping `0n` values.

- [#5411](https://github.com/wevm/viem/pull/5411) [`3708ffc`](https://github.com/wevm/viem/commit/3708ffc3fc8ec0a957a577970da87903811cf649) Thanks [@jxom](https://github.com/jxom)! - `viem/tempo`: Removed the `decimals` read when resolving an insufficient TIP-20 balance error.

- [#5275](https://github.com/wevm/viem/pull/5275) [`7315f38`](https://github.com/wevm/viem/commit/7315f38a32e83d489d412a73225afd8a3d9f614d) Thanks [@mmv08](https://github.com/mmv08)! - Fixed `Actions.transaction.getConfirmations` returning zero or negative counts when the block number was cached or behind the transaction's block.

- [#5271](https://github.com/wevm/viem/pull/5271) [`2867b2a`](https://github.com/wevm/viem/commit/2867b2a88458044af6aa84fc5494539eab05e143) Thanks [@loveyuanfandj-glitch](https://github.com/loveyuanfandj-glitch)! - Added ValueChain mainnet and testnet chains.

- [#4930](https://github.com/wevm/viem/pull/4930) [`d5cac0a`](https://github.com/wevm/viem/commit/d5cac0ad0f5e4c41f0e8d5ae1d52405b6a1195ca) Thanks [@jxom](https://github.com/jxom)! - Fixed `Actions.transaction.waitForReceipt` reporting another transaction in the same nonce slot as a replacement when the awaited transaction was already mined but its receipt was not yet indexed.

- [#5381](https://github.com/wevm/viem/pull/5381) [`5d11346`](https://github.com/wevm/viem/commit/5d11346a9be71deceb3ee4998cbc281a57c2887a) Thanks [@jxom](https://github.com/jxom)! - Limited the default catch-up of `Actions.block.watch` to 100 missed blocks, so a longer gap emits only the latest block.

- [#5330](https://github.com/wevm/viem/pull/5330) [`1f9c2f0`](https://github.com/wevm/viem/commit/1f9c2f00e6b18b194aa510ee09f4ae684af2e976) Thanks [@jxom](https://github.com/jxom)! - Fixed `Actions.event.watch` and `Actions.contract.watchEvent` in the `eth_getLogs` fallback stalling for good once the blocks since the last poll exceeded the RPC Provider's block range, log count or response size limit, repeating logs when an RPC node reported a lower block number, missing logs from the first polling interval, and ignoring `strict`.

- [#5380](https://github.com/wevm/viem/pull/5380) [`b650f56`](https://github.com/wevm/viem/commit/b650f56c15ea3f7a08a0e1f4afa178bfc206b576) Thanks [@mmv08](https://github.com/mmv08)! - Fixed `Actions.block.watch` and `Actions.block.watchNumber` skipping blocks over HTTP on fast chains such as Monad and Arbitrum, and `Actions.block.watch` falling behind while it caught up on missed blocks.

- [#5258](https://github.com/wevm/viem/pull/5258) [`13c0386`](https://github.com/wevm/viem/commit/13c03860b3688153af22368ba42709955880edfc) Thanks [@jxom](https://github.com/jxom)! - Fixed requests with an aborted `signal` staying pending on transports that ignore the signal.

- [#5266](https://github.com/wevm/viem/pull/5266) [`6834ec4`](https://github.com/wevm/viem/commit/6834ec45211b8b38167950c6a9a5f5d3c1406c47) Thanks [@bxpana](https://github.com/bxpana)! - Added ZKsync Era Testnet chain.

## 3.0.0-next.14

### Patch Changes

- [#5222](https://github.com/wevm/viem/pull/5222) [`9b06f93`](https://github.com/wevm/viem/commit/9b06f93a587bd4ead27fa77c7bc192b404a1b8c5) Thanks [@jxom](https://github.com/jxom)! - Updated Arc Testnet RPC and block explorer URLs from `arc.network` to `arc.io`.

- [#5222](https://github.com/wevm/viem/pull/5222) [`9b06f93`](https://github.com/wevm/viem/commit/9b06f93a587bd4ead27fa77c7bc192b404a1b8c5) Thanks [@jxom](https://github.com/jxom)! - Updated the Tempo mainnet and testnet Earn factory addresses to the latest releases.

- [#5222](https://github.com/wevm/viem/pull/5222) [`9b06f93`](https://github.com/wevm/viem/commit/9b06f93a587bd4ead27fa77c7bc192b404a1b8c5) Thanks [@jxom](https://github.com/jxom)! - Fixed the `http` transport `timeout` not applying while the response body is read, or when the request is given an abort `signal`.

- [#5222](https://github.com/wevm/viem/pull/5222) [`9b06f93`](https://github.com/wevm/viem/commit/9b06f93a587bd4ead27fa77c7bc192b404a1b8c5) Thanks [@jxom](https://github.com/jxom)! - `viem/tempo`: Changed `KeyAuthorizationManager.from` to build the manager from a `Store` instead of a custom `get`/`set`/`remove` source.

- [#5222](https://github.com/wevm/viem/pull/5222) [`9b06f93`](https://github.com/wevm/viem/commit/9b06f93a587bd4ead27fa77c7bc192b404a1b8c5) Thanks [@jxom](https://github.com/jxom)! - Updated `ox` to `1.8.8`, which keeps absent Tempo key-authorization `limits` distinct from an empty list and fixes signatures dropping the first parameter after `( `.

- [#5222](https://github.com/wevm/viem/pull/5222) [`9b06f93`](https://github.com/wevm/viem/commit/9b06f93a587bd4ead27fa77c7bc192b404a1b8c5) Thanks [@jxom](https://github.com/jxom)! - Added QMS Testnet chain.

- [#5222](https://github.com/wevm/viem/pull/5222) [`9b06f93`](https://github.com/wevm/viem/commit/9b06f93a587bd4ead27fa77c7bc192b404a1b8c5) Thanks [@jxom](https://github.com/jxom)! - `viem/tempo`: Added the `Relay.keyAuthorization` plugin, which saves signed key authorizations and attaches them to the access key's next transaction, and `Actions.accessKey.saveAuthorization` for authorizations signed elsewhere.

- [#5222](https://github.com/wevm/viem/pull/5222) [`9b06f93`](https://github.com/wevm/viem/commit/9b06f93a587bd4ead27fa77c7bc192b404a1b8c5) Thanks [@jxom](https://github.com/jxom)! - Fixed `unsubscribe()` on `webSocket` and `ipc` transports using a stale subscription id after a reconnect, which leaked the subscription.

- [#5222](https://github.com/wevm/viem/pull/5222) [`9b06f93`](https://github.com/wevm/viem/commit/9b06f93a587bd4ead27fa77c7bc192b404a1b8c5) Thanks [@jxom](https://github.com/jxom)! - `viem/tempo`: Renamed experimental native multisig APIs to configurable accounts ([TIP-1107](https://tips.sh/1107)), including `Account.fromConfig`, `Relay.accounts`, and `Actions.accounts`.

- [#5222](https://github.com/wevm/viem/pull/5222) [`9b06f93`](https://github.com/wevm/viem/commit/9b06f93a587bd4ead27fa77c7bc192b404a1b8c5) Thanks [@jxom](https://github.com/jxom)! - Fixed `Actions.wallet.waitForCallsStatus` resolving concurrent waits for the same id with the first caller's polling, retry, and status options.

- [#5222](https://github.com/wevm/viem/pull/5222) [`9b06f93`](https://github.com/wevm/viem/commit/9b06f93a587bd4ead27fa77c7bc192b404a1b8c5) Thanks [@jxom](https://github.com/jxom)! - Fixed `Actions.transaction.waitForReceipt` missing a replacement transaction, or reporting a repriced one as `replaced`, when the RPC returned addresses in a different case.

- [#5222](https://github.com/wevm/viem/pull/5222) [`9b06f93`](https://github.com/wevm/viem/commit/9b06f93a587bd4ead27fa77c7bc192b404a1b8c5) Thanks [@jxom](https://github.com/jxom)! - Added the current Tempo ZoneInbox ABI, selectors, and predeploy address for reading deposit outcomes.

## 3.0.0-next.13

### Patch Changes

- [#4930](https://github.com/wevm/viem/pull/4930) [`f8cdce7`](https://github.com/wevm/viem/commit/f8cdce7a6d5b17a9ea324b5943cf5f1b9e0c601e) Thanks [@jxom](https://github.com/jxom)! - Fixed Tempo transaction types to accept external fee-payer URLs.

## 3.0.0-next.12

### Patch Changes

- [#4930](https://github.com/wevm/viem/pull/4930) [`a2bbd49`](https://github.com/wevm/viem/commit/a2bbd49cebcc2e77034a12002ace6c0c01f9f171) Thanks [@jxom](https://github.com/jxom)! - Fixed declaration generation for inferred clients and chains that reference frame transaction and Tempo multisig types.

## 3.0.0-next.11

### Patch Changes

- [#5128](https://github.com/wevm/viem/pull/5128) [`51f9ad9`](https://github.com/wevm/viem/commit/51f9ad9595507c3a5032254b3bc1ed342af2ba68) Thanks [@cryptocandyio](https://github.com/cryptocandyio)! - Added CandyChain.

- [#5133](https://github.com/wevm/viem/pull/5133) [`1106809`](https://github.com/wevm/viem/commit/1106809071cea88eca868262ee7bab8a82081338) Thanks [@garywilson87](https://github.com/garywilson87)! - Added the BlockDAG chain definition.

- [#5130](https://github.com/wevm/viem/pull/5130) [`33e3777`](https://github.com/wevm/viem/commit/33e3777a5291ec3553efcde025cf5d6037960002) Thanks [@HereForTheTechNFT](https://github.com/HereForTheTechNFT)! - Fixed `getGame`, `getGames`, `getTimeToNextGame` and `getTimeToNextL2Output` to treat a dispute game (or L2 output) at exactly the requested L2 block number as covering it.

- [#5132](https://github.com/wevm/viem/pull/5132) [`e713dba`](https://github.com/wevm/viem/commit/e713dba3b7e2751457952dc2ed6fde1fca2fbfeb) Thanks [@gjija](https://github.com/gjija)! - Fixed `Siwe.parseMessage` losing or truncating `resources` when `Resources:` appeared in the statement, URI, Request ID or a resource.

- Fixed `Siwe.createMessage` and `Siwe.parseMessage` accepting commas in URI schemes.

## 3.0.0-next.10

### Patch Changes

- [#5007](https://github.com/wevm/viem/pull/5007) [`a4058d9`](https://github.com/wevm/viem/commit/a4058d9f71ac858a22acfe2274d972017bcefef9) Thanks [@jxom](https://github.com/jxom)! - Fixed `multicall` asset discovery across reverting, state-dependent, malformed, and newly deployed tokens while pinning stable block tags and isolating balance probes.

## 3.0.0-next.9

### Patch Changes

- [#4919](https://github.com/wevm/viem/pull/4919) [`e45e91e`](https://github.com/wevm/viem/commit/e45e91e28c057535956803bae6a2d3ffe9ae74cf) Thanks [@2wheeh](https://github.com/2wheeh)! - Allowed `extractEvent`/`extractEvents` and the OP Stack log extractors to decode partial EIP-5792 call receipt logs without casts while preserving the input logs' block and transaction metadata in their return types.

## 3.0.0-next.8

### Patch Changes

- [#4981](https://github.com/wevm/viem/pull/4981) [`ab704f4`](https://github.com/wevm/viem/commit/ab704f425e3083551fa055aa4f21e32b89f57462) Thanks [@struong](https://github.com/struong)! - Fixed Zone withdrawal sender tags to include the emitted fallback nonce.

## 3.0.0-next.7

### Patch Changes

- [#4975](https://github.com/wevm/viem/pull/4975) [`a2cfbb4`](https://github.com/wevm/viem/commit/a2cfbb45c6dadd76a7bfadaca1d9b3e9a78ae137) Thanks [@jxom](https://github.com/jxom)! - Prevented sequential nonce consumption when chain preparation selected an expiring nonce.

## 3.0.0-next.6

### Patch Changes

- [#4945](https://github.com/wevm/viem/pull/4945) [`f9ed404`](https://github.com/wevm/viem/commit/f9ed4046936c373bd59023e0a8f35a4bc90f4b07) Thanks [@jxom](https://github.com/jxom)! - Added `AesGcm` encryption and `MlDsa44` post-quantum signature utilities.

  ```ts
  import { AesGcm, MlDsa44 } from "viem/utils";

  const keyPair = MlDsa44.createKeyPair();
  const key = await AesGcm.getKey({ password: "example" });
  ```

## 3.0.0-next.5

### Patch Changes

- [#4941](https://github.com/wevm/viem/pull/4941) [`859db08`](https://github.com/wevm/viem/commit/859db08f3dc538d4a90c1dc40aca7be9e79c0343) Thanks [@jxom](https://github.com/jxom)! - Added `Account.fromPrf` to derive local secp256k1 accounts from WebAuthn PRF output.

  ```ts
  import { Account } from "viem";
  import { WebAuthn } from "viem/utils";

  const credential = await WebAuthn.createCredential({
    name: "Example",
    prf: true,
  });
  const account = Account.fromPrf(credential.prf);
  ```

## 3.0.0-next.4

### Patch Changes

- [#4936](https://github.com/wevm/viem/pull/4936) [`7f25b11`](https://github.com/wevm/viem/commit/7f25b117f50ffcc241ca007de63dadb24a3b7ebc) Thanks [@jxom](https://github.com/jxom)! - Fixed `TS2742` and `TS7056` when consumers export inferred Viem values, by making every type reachable from public signatures nameable through a `viem/_types/*` subpath and compiler-support re-exports.

  ```ts
  // previously failed to emit a `.d.ts` without an explicit type annotation
  export const client = Client.create({
    chain: mainnet,
    transport: http(),
  }).extend(publicActions());
  ```

## 3.0.0-next.3

### Patch Changes

- [#4923](https://github.com/wevm/viem/pull/4923) [`ef683e6`](https://github.com/wevm/viem/commit/ef683e62728d7cc00a0ee0cff5aab46ac3c41561) Thanks [@jxom](https://github.com/jxom)! - Updated `ox` to `1.2.0`.

## 3.0.0-next.2

### Patch Changes

- [#4921](https://github.com/wevm/viem/pull/4921) [`3e017f3`](https://github.com/wevm/viem/commit/3e017f3f2375b922be81bb660fe5f473c27ce6a9) Thanks [@jxom](https://github.com/jxom)! - Moved the typed-data signing and verification actions to `Actions.typedData` and the SIWE verification action to `Actions.siwe`.

## 3.0.0-next.1

### Patch Changes

- [#4914](https://github.com/wevm/viem/pull/4914) [`d73fd55`](https://github.com/wevm/viem/commit/d73fd55d90f21ac31fb909515abf16cde061e238) Thanks [@jxom](https://github.com/jxom)! - Added `Client.fromV2` and `Client.toV2` to adapt base Clients between Viem v2 and v3.

  ```ts
  import { publicActions as publicActionsV2 } from "viem";
  import { Client, http } from "viem-v3";

  const client = Client.create({ transport: http() });
  const publicClientV2 = Client.toV2(client).extend(publicActionsV2);
  ```

## 3.0.0-next.0

### Major Changes

- [#4909](https://github.com/wevm/viem/pull/4909) [`e6c40d3`](https://github.com/wevm/viem/commit/e6c40d37a961db09b421752111b9f562f7799d08) Thanks [@jxom](https://github.com/jxom)! - Released v3; refer to the [v2 migration guide](https://v3.viem.sh/docs/v2-migration).
