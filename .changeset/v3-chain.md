---
"viem": major
---

Chain definitions were moved from `defineChain` to the `Chain` namespace.

```diff
-import { defineChain } from 'viem'
+import { Chain } from 'viem'
 
-export const example = defineChain({
+export const example = Chain.from({
   id: 123,
   name: 'Example',
   nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
   rpcUrls: { default: { http: ['https://example.com'] } },
 })
```

Chain formatter configuration was replaced by RPC/native codecs. `fromRpc` converters decode wire values to native shapes; `toRpc` converters encode native values to wire shapes (request option types resolve from the parameter type of `codecs.transactionRequest.toRpc`). All formatter constructors were removed with the system: `defineFormatter`, `defineBlock`, `defineTransaction`, `defineTransactionReceipt`, and `defineTransactionRequest`, along with the formatter `exclude` feature (`ExtractChainFormatterExclude`) — converters simply omit keys from their return value.

```diff
-import { defineChain, formatters } from 'viem'
+import { Chain } from 'viem'
+import { Block } from 'viem/utils'
 
-const chain = defineChain({
-  formatters: {
-    block: formatters.defineBlock({ format(args) { return args } }),
-  },
+const chain = Chain.from({
+  codecs: {
+    block: {
+      fromRpc: (rpc) => Block.fromRpc(rpc),
+    },
+  },
 })
```

Chain-aware formatted types moved from the `Formatted*` helpers to `Chain.Extract*`, which infer from the chain's codecs.

```diff
- import type {
-   ExtractFormattedTransactionRequest,
-   FormattedBlock,
-   FormattedTransaction,
-   FormattedTransactionReceipt,
-   FormattedTransactionRequest,
- } from 'viem'
+ import type { Chain } from 'viem'

- type Block = FormattedBlock<chain>
- type Transaction = FormattedTransaction<chain>
- type Receipt = FormattedTransactionReceipt<chain>
- type Request = FormattedTransactionRequest<chain>
- type NarrowedRequest = ExtractFormattedTransactionRequest<chain>
+ type Block = Chain.ExtractBlock<chain>
+ type Transaction = Chain.ExtractTransaction<chain>
+ type Receipt = Chain.ExtractTransactionReceipt<chain>
+ type Request = Chain.ExtractTransactionRequest<chain>
+ type NarrowedRequest = Chain.ExtractTransactionRequest<chain>
```

Deprecated chain fee fields were removed in favor of `maxPriorityFeePerGas`.

```diff
-const chain = defineChain({
+const chain = Chain.from({
   fees: {
-    defaultPriorityFee: 1_000_000_000n,
+    maxPriorityFeePerGas: 1_000_000_000n,
   },
 })
```

Experimental and deprecated extension chain fields were renamed or removed from the chain shape; `extendSchema` moved onto the `Chain` namespace.

```diff
-const chain = defineChain({
-  experimental_preconfirmationTime: 1_000,
-  custom: { slug: 'example' },
-  extendSchema: extendSchema<{ slug: string }>(),
+const chain = Chain.from({
+  preconfirmationTime: 1_000,
+  extendSchema: Chain.extendSchema<{ slug: string }>(),
+  slug: 'example',
 })
```

Chain transaction hooks (`toEnvelope`/`getSignPayload`/`serialize`) accept custom envelope types without casts, and the `verifyHash` hook receives the caller's `mode` and block context.

Added `Chain.supportsTransactionReplacementDetection` to control the default replacement scan in `Actions.transaction.waitForReceipt`; Zone chains disabled it.

`filterChains` moved to `Chain.filter`, preserving token-support and testnet narrowing.

```diff
- import { filterChains } from 'viem'
+ import { Chain } from 'viem'

- const supported = filterChains({ chains, token: usdc })
+ const supported = Chain.filter({ chains, token: usdc })
```

`assertCurrentChain` and its error types moved to the `Chain` namespace.

```diff
-import { assertCurrentChain, type AssertCurrentChainErrorType } from 'viem/chains/utils'
+import { Chain } from 'viem'

-assertCurrentChain({ chain, currentChainId })
-type Error = AssertCurrentChainErrorType
+Chain.assertCurrent({ chain, currentChainId })
+type Error = Chain.assertCurrent.ErrorType
+Chain.MismatchError
+Chain.NotFoundError
```

`ChainDoesNotSupportContract` was renamed to `Chain.DoesNotSupportContract`.

```diff
-import { ChainDoesNotSupportContract } from 'viem'
+import { Chain } from 'viem'

-throw new ChainDoesNotSupportContract(...)
+throw new Chain.DoesNotSupportContract(...)
```

Added Defi Oracle Meta Mainnet and Robinhood mainnet and testnet chain definitions.

```diff
+ import {
+   defiOracleMetaMainnet,
+   robinhood,
+   robinhoodTestnet,
+ } from 'viem/chains'
```

Removed chain definitions that were not retained for v3; applications can define them locally with `Chain.from`.

```diff
- import { optimismGoerli, shibarium, shiden, ubiq, zhejiang } from 'viem/chains'
+ import { Chain } from 'viem'

+ const chain = Chain.from({ id, name, nativeCurrency, rpcUrls })
```

Removed 25 additional obsolete or superseded chain definitions without built-in replacements.

```diff
- import {
-   astarZkEVM,
-   astarZkyoto,
-   celoAlfajores,
-   fantomSonicTestnet,
-   flowPreviewnet,
-   foundry,
-   kakarotSepolia,
-   klaytn,
-   klaytnBaobab,
-   lineaGoerli,
-   lineaTestnet,
-   metisGoerli,
-   plume,
-   plumeDevnet,
-   plumeTestnet,
-   polygonZkEvmTestnet,
-   skaleCryptoColosseum,
-   skaleHumanProtocol,
-   skaleRazor,
-   sonicBlazeTestnet,
-   taikoHekla,
-   taikoJolnir,
-   taikoKatla,
-   taikoTestnetSepolia,
-   zeroGGalileoTestnet,
- } from 'viem/chains'
+ import { Chain } from 'viem'

+ const chain = Chain.from({ id, name, nativeCurrency, rpcUrls })
```

Removed 115 additional chain definitions that were not retained for v3; applications can define them locally with `Chain.from`.

```diff
- import {
-   acria,
-   alephZero,
-   alephZeroTestnet,
-   arbitrumGoerli,
-   areonNetworkTestnet,
-   arthera,
-   artheraTestnet,
-   basecampTestnet,
-   bitTorrentTestnet,
-   bronos,
-   bronosTestnet,
-   bxn,
-   bxnTestnet,
-   chips,
-   coreTestnet1,
-   crab,
-   cyberTestnet,
-   datahavenTestnet,
-   defichainEvmTestnet,
-   dodochainTestnet,
-   edexaTestnet,
-   edgeless,
-   electroneumTestnet,
-   elysiumTestnet,
-   eon,
-   eos,
-   eosTestnet,
-   ethernity,
-   evmos,
-   exsatTestnet,
-   fantomTestnet,
-   filecoinHyperspace,
-   flame,
-   fluence,
-   fluenceStage,
-   fluenceTestnet,
-   form,
-   formTestnet,
-   funkiSepolia,
-   fusion,
-   fusionTestnet,
-   garnet,
-   geist,
-   glideL1Protocol,
-   glideL2Protocol,
-   gobi,
-   ham,
-   happychainTestnet,
-   hppSepolia,
-   huddle01Mainnet,
-   humanityTestnet,
-   initVerseGenesis,
-   jasmyChain,
-   jasmyChainTestnet,
-   juneoSocotraTestnet,
-   kakarotStarknetSepolia,
-   kardiaChain,
-   koi,
-   kroma,
-   kromaSepolia,
-   lumozTestnet,
-   mandala,
-   mantaTestnet,
-   mekong,
-   meld,
-   metachainIstanbul,
-   mezo,
-   mintSepoliaTestnet,
-   mitosisTestnet,
-   morphHolesky,
-   morphSepolia,
-   nahmii,
-   nautilus,
-   nexi,
-   nexilix,
-   nitrographTestnet,
-   otimDevnet,
-   paseoPassetHub,
-   phoenix,
-   playfiAlbireo,
-   plinga,
-   polterTestnet,
-   premiumBlockTestnet,
-   pumpfiTestnet,
-   pyrope,
-   ql1,
-   real,
-   redstone,
-   rivalz,
-   rolluxTestnet,
-   rss3Sepolia,
-   sanko,
-   satoshiVM,
-   satoshiVMTestnet,
-   shardeumSphinx,
-   shibariumTestnet,
-   shimmerTestnet,
-   swellchainTestnet,
-   taraxa,
-   taraxaTestnet,
-   teaSepolia,
-   thunderTestnet,
-   tiktrixTestnet,
-   treasureTopaz,
-   uniqueQuartz,
-   unreal,
-   vision,
-   visionTestnet,
-   wmcTestnet,
-   xoneMainnet,
-   xrOne,
-   zilliqaTestnet,
-   zkLinkNovaSepoliaTestnet,
-   zkXPLA,
-   zkXPLATestnet,
- } from 'viem/chains'
+ import { Chain } from 'viem'

+ const chain = Chain.from({ id, name, nativeCurrency, rpcUrls })
```

Deprecated chain exports were removed: `statusNetworkSepolia`, `statusSepolia`, `storyOdyssey`, `storyTestnet`, `weaveVMAlphanet` (use `loadAlphanet`), `x1Testnet` (use `xLayerTestnet`), `zeroG`, and the `zkSync`, `zkSyncInMemoryNode`, `zkSyncLocalNode`, and `zkSyncSepoliaTestnet` casing aliases (use `zksync`, `zksyncInMemoryNode`, `zksyncLocalNode`, and `zksyncSepoliaTestnet`).

`viem/chains` no longer re-exports extension serializers, assertions, or their types. The celo, op-stack, and zksync chain definitions remain as plain chains, but `assertTransactionCIP42Celo`, `assertTransactionCIP64Celo`, `assertTransactionDepositOpStack`, `serializeTransactionCelo`, `serializeTransactionOpStack`, `serializersCelo`, `serializersOpStack`, and the extension-specific types formerly re-exported through `viem/chains` (`Celo*`, `OpStack*`, `ZkSync*`, `ChainEIP712`, `RpcTransactionCIP42`/`CIP64`, `TransactionCIP42`/`CIP64`, `TransactionSerializableDeposit`/`TransactionSerializedDeposit`, and related request/serializable/serialized shapes) were removed together with the `viem/celo`, `viem/op-stack`, and `viem/zksync` entrypoints.

```diff
- import { optimism, serializersOpStack } from 'viem/chains'
+ import { optimism } from 'viem/chains'

+ // Extension serializers have no v3 equivalent; build on `Chain.from`
+ // with `codecs` and `transaction` hooks instead.
```
