# viem

## 2.45.2

### Patch Changes

- [#4300](https://github.com/wevm/viem/pull/4300) [`cc60e25ca55c022a56ed9e991ec23cb615593da6`](https://github.com/wevm/viem/commit/cc60e25ca55c022a56ed9e991ec23cb615593da6) Thanks [@LXPDevs](https://github.com/LXPDevs)! - Added LuxePorts chain.

- [#4306](https://github.com/wevm/viem/pull/4306) [`e3901661ba0442d6ae66c4d702396e8ee247d03f`](https://github.com/wevm/viem/commit/e3901661ba0442d6ae66c4d702396e8ee247d03f) Thanks [@izharan-fireblocks](https://github.com/izharan-fireblocks)! - Added `WalletConnectSessionSettlementError` as a non-retryable transport error.

- [#4301](https://github.com/wevm/viem/pull/4301) [`662215f12310c3c2b17424093d3f4922693432f2`](https://github.com/wevm/viem/commit/662215f12310c3c2b17424093d3f4922693432f2) Thanks [@xGreen-project](https://github.com/xGreen-project)! - Added XGR Mainnet chain.

- [#4315](https://github.com/wevm/viem/pull/4315) [`56d0920fd654ab93e89fff77769b0c982b8928d5`](https://github.com/wevm/viem/commit/56d0920fd654ab93e89fff77769b0c982b8928d5) Thanks [@jxom](https://github.com/jxom)! - Fixed `sendCallsSync` to respect client-level action overrides (e.g. smart account clients).

- [#4294](https://github.com/wevm/viem/pull/4294) [`8c3fa2684820c80e8908cc799fd47815594e4871`](https://github.com/wevm/viem/commit/8c3fa2684820c80e8908cc799fd47815594e4871) Thanks [@Oighty](https://github.com/Oighty)! - Added Citrea Mainnet chain support.

- [#4321](https://github.com/wevm/viem/pull/4321) [`059274e18c19270e7f7e98f0b087e7986d5a6dd7`](https://github.com/wevm/viem/commit/059274e18c19270e7f7e98f0b087e7986d5a6dd7) Thanks [@highonrice](https://github.com/highonrice)! - Updated the native currency of Stable Mainnet.

- [#4319](https://github.com/wevm/viem/pull/4319) [`746f5ae3b220313748bf7e0eb2d86f07848b6628`](https://github.com/wevm/viem/commit/746f5ae3b220313748bf7e0eb2d86f07848b6628) Thanks [@brotherlymite](https://github.com/brotherlymite)! - Added etherscan explorer for MegaETH.

- [#4305](https://github.com/wevm/viem/pull/4305) [`428ef7cd7b4d6e9860296df841ce2f4a8d494bc1`](https://github.com/wevm/viem/commit/428ef7cd7b4d6e9860296df841ce2f4a8d494bc1) Thanks [@LxpSrDev](https://github.com/LxpSrDev)! - Added LuxePorts chain.

## 2.45.1

### Patch Changes

- [#4273](https://github.com/wevm/viem/pull/4273) [`bf3f117aa4d6a4693af29894b1c27e130623cbc7`](https://github.com/wevm/viem/commit/bf3f117aa4d6a4693af29894b1c27e130623cbc7) Thanks [@nicodlz](https://github.com/nicodlz)! - Added Subtensor EVM chain.

- [#4272](https://github.com/wevm/viem/pull/4272) [`a3a4ff9a25c8f31d3caef533d3d100cf22c1ea5e`](https://github.com/wevm/viem/commit/a3a4ff9a25c8f31d3caef533d3d100cf22c1ea5e) Thanks [@matzapata](https://github.com/matzapata)! - Added Alpen Testnet

- [#4228](https://github.com/wevm/viem/pull/4228) [`26ffdfbef41e08a4d6837051eda615fb659c2c31`](https://github.com/wevm/viem/commit/26ffdfbef41e08a4d6837051eda615fb659c2c31) Thanks [@sakulstra](https://github.com/sakulstra)! - Improved performance in `parseEventLogs` by memoizing.

- [#4275](https://github.com/wevm/viem/pull/4275) [`ea8398b80c6fa90747e979d959c32e276bdd43e1`](https://github.com/wevm/viem/commit/ea8398b80c6fa90747e979d959c32e276bdd43e1) Thanks [@GiovaniGuizzo](https://github.com/GiovaniGuizzo)! - Added KiiChain mainnet chain definition

- [#4259](https://github.com/wevm/viem/pull/4259) [`1ae28c2a9acb55b8fc599643549a52ec71a02e72`](https://github.com/wevm/viem/commit/1ae28c2a9acb55b8fc599643549a52ec71a02e72) Thanks [@cruzdanilo](https://github.com/cruzdanilo)! - Fixed error decoding in `simulateBlocks` when RPC returns revert data in `returnData` instead of `error.data`.

- [#4260](https://github.com/wevm/viem/pull/4260) [`1f2a1839c201a2f5b97bddf26d605fb0394cdbd7`](https://github.com/wevm/viem/commit/1f2a1839c201a2f5b97bddf26d605fb0394cdbd7) Thanks [@akitothemoon](https://github.com/akitothemoon)! - Added Horizen Testnet.

- [`4fe411bd4231ec0a89159723ec68fcfe13c10071`](https://github.com/wevm/viem/commit/4fe411bd4231ec0a89159723ec68fcfe13c10071) Thanks [@jxom](https://github.com/jxom)! - Added `nonce` and `faucet.fundSync` actions to decorator.

## 2.45.0

### Minor Changes

- [#4249](https://github.com/wevm/viem/pull/4249) [`0e1d62dae5091e43bd4f12102e270a17a1456ffe`](https://github.com/wevm/viem/commit/0e1d62dae5091e43bd4f12102e270a17a1456ffe) Thanks [@dgca](https://github.com/dgca)! - Added `dataSuffix` param to createWalletClient. When added, this will automatically add a dataSuffix to transaction actions submitted by this client.

- [#4264](https://github.com/wevm/viem/pull/4264) [`dc4c100fec297efab4f38d92995832d9bb86d3c1`](https://github.com/wevm/viem/commit/dc4c100fec297efab4f38d92995832d9bb86d3c1) Thanks [@dgca](https://github.com/dgca)! - Added `dataSuffix` param to `createBundlerClient` and related `prepareUserOperation`/`sendUserOperation` actions to attach additional calldata to transactions.

### Patch Changes

- [#4256](https://github.com/wevm/viem/pull/4256) [`08e1bb654a6f8d7075cc5f634d5b83c4d9a0379f`](https://github.com/wevm/viem/commit/08e1bb654a6f8d7075cc5f634d5b83c4d9a0379f) Thanks [@paperCPU](https://github.com/paperCPU)! - Added stable mainnet and updated stable testnet definitions

- [#4267](https://github.com/wevm/viem/pull/4267) [`fc9c6e373c94b6a278493c8f499730232de46b2b`](https://github.com/wevm/viem/commit/fc9c6e373c94b6a278493c8f499730232de46b2b) Thanks [@marthendalnunes](https://github.com/marthendalnunes)! - Exported `SignTransactionRequest` type

- [#4257](https://github.com/wevm/viem/pull/4257) [`685c3f867f38d24df547643540b0bb53ec52af5a`](https://github.com/wevm/viem/commit/685c3f867f38d24df547643540b0bb53ec52af5a) Thanks [@gndelia](https://github.com/gndelia)! - Exported missing OP Stack actions

- [#4247](https://github.com/wevm/viem/pull/4247) [`d2b3c835806d9397146830551466fc6afd346fa1`](https://github.com/wevm/viem/commit/d2b3c835806d9397146830551466fc6afd346fa1) Thanks [@kiyoakii](https://github.com/kiyoakii)! - Added MegaETH Mainnet chain and fixed MegaETH Testnet chain ID (6342 → 6343).

- [#4254](https://github.com/wevm/viem/pull/4254) [`93c70b4b4a25cbdd25ee3007b4fc87a79dd14126`](https://github.com/wevm/viem/commit/93c70b4b4a25cbdd25ee3007b4fc87a79dd14126) Thanks [@awesamarth](https://github.com/awesamarth)! - Added RISE Mainnet

## 2.44.4

### Patch Changes

- [#4245](https://github.com/wevm/viem/pull/4245) [`fcd86e90785b101d5f903ffc15478baa4442fe01`](https://github.com/wevm/viem/commit/fcd86e90785b101d5f903ffc15478baa4442fe01) Thanks [@jxom](https://github.com/jxom)! - Added `assertChainId` parameter to `sendTransaction` and `sendTransactionSync` to optionally skip chain ID assertion.

## 2.44.3

### Patch Changes

- [#4244](https://github.com/wevm/viem/pull/4244) [`73d02fbb61a9fecbe03dfad648e1fe7d61497d3f`](https://github.com/wevm/viem/commit/73d02fbb61a9fecbe03dfad648e1fe7d61497d3f) Thanks [@gorried](https://github.com/gorried)! - `viem/tempo`: Added actions validator tokens on the `actions.fee` namespace.

- [#4243](https://github.com/wevm/viem/pull/4243) [`76f087bfeb7a77bd25e60acade122724e15b5729`](https://github.com/wevm/viem/commit/76f087bfeb7a77bd25e60acade122724e15b5729) Thanks [@gorried](https://github.com/gorried)! - `viem/tempo`: Added `validator` actions.

- [`c90fc03e0d5d80ab12dc4f24295a88549f4df8b7`](https://github.com/wevm/viem/commit/c90fc03e0d5d80ab12dc4f24295a88549f4df8b7) Thanks [@jxom](https://github.com/jxom)! - Improved partial decoding of events, in case indexes are missing.

## 2.44.2

### Patch Changes

- [#4229](https://github.com/wevm/viem/pull/4229) [`ffdc0f11cf3d87c91288d5d6242687e20ae15b42`](https://github.com/wevm/viem/commit/ffdc0f11cf3d87c91288d5d6242687e20ae15b42) Thanks [@frangio](https://github.com/frangio)! - Fixed `hexToNumber` silent error when the value exceeds the safe range.

- [#4227](https://github.com/wevm/viem/pull/4227) [`d235b894009c327145267a48c1739cd865ccf55b`](https://github.com/wevm/viem/commit/d235b894009c327145267a48c1739cd865ccf55b) Thanks [@tomiir](https://github.com/tomiir)! - Added support for ADI_Chain.

- [`51b6bf6d452fbabf7516614e2f0ca976edd3f19a`](https://github.com/wevm/viem/commit/51b6bf6d452fbabf7516614e2f0ca976edd3f19a) Thanks [@jxom](https://github.com/jxom)! - Added `tempo` chain mainnet placeholder.

- [#4211](https://github.com/wevm/viem/pull/4211) [`e5050455f226de77587b0069532e886b520e46c2`](https://github.com/wevm/viem/commit/e5050455f226de77587b0069532e886b520e46c2) Thanks [@akitothemoon](https://github.com/akitothemoon)! - Added zkXPLA network.

- [#4234](https://github.com/wevm/viem/pull/4234) [`4d6349593f21c37fa2e97945521efc011a1bb350`](https://github.com/wevm/viem/commit/4d6349593f21c37fa2e97945521efc011a1bb350) Thanks [@jxom](https://github.com/jxom)! - Added support for embeddable Basic authentication on `http` transport.

## 2.44.1

### Patch Changes

- [#4225](https://github.com/wevm/viem/pull/4225) [`9d0a5a0b345d33c5ae396a81a3df87b66e4ee6b0`](https://github.com/wevm/viem/commit/9d0a5a0b345d33c5ae396a81a3df87b66e4ee6b0) Thanks [@jxom](https://github.com/jxom)! - `viem/tempo`: Bumped gas for `feePayer` + `keyAuthorization` tempo transactions.

## 2.44.0

### Minor Changes

- [#4201](https://github.com/wevm/viem/pull/4201) [`0268ca88c67c7851ae03d8d41508657f2b62729d`](https://github.com/wevm/viem/commit/0268ca88c67c7851ae03d8d41508657f2b62729d) Thanks [@jxom](https://github.com/jxom)! - ### `viem/tempo` Extension

  Added support for Tempo Moderato testnet.
  - **(Breaking)**: Renamed `tempoTestnet` → `tempoModerato`. The old export is deprecated but still available as an alias.
  - **(Breaking)**: Renamed `reward.start` → `reward.distribute`: Renamed for distributing rewards (no longer supports streaming).
  - **(Breaking)**: Renamed `reward.getTotalPerSecond` → `reward.getGlobalRewardPerToken`: Returns the global reward per token value instead of per-second rate.
  - **(Breaking)**: Renamed `reward.watchRewardScheduled` → `reward.watchRewardDistributed`: Watches for reward distributed events.
  - **(Breaking)**: Removed `nonce.getNonceKeyCount`.
  - **(Breaking)**: Removed `nonce.watchActiveKeyCountChanged`.
  - **(Breaking)**: Removed `amm.watchFeeSwap` (FeeSwap event no longer emitted by protocol).
  - **(Breaking)**: `OrderPlaced` event now includes `isFlipOrder` and `flipTick` fields. The `FlipOrderPlaced` event has been removed and merged into `OrderPlaced`.
  - **(Breaking)**: Renamed `Address.stablecoinExchange` → `Address.stablecoinDex`.
  - **(Breaking)**: Renamed `Abis.stablecoinExchange` → `Abis.stablecoinDex`.
  - Added `dex.cancelStale` action to cancel stale orders from restricted makers.
  - Added `salt` parameter to `token.create`.

### Patch Changes

- [`e9967a932db94b62e9bb8fb309865a3104f59788`](https://github.com/wevm/viem/commit/e9967a932db94b62e9bb8fb309865a3104f59788) Thanks [@tmm](https://github.com/tmm)! - Exported missing types for inference.

- [`295bd73bc620f57448d43bcb80acfae3e4562b99`](https://github.com/wevm/viem/commit/295bd73bc620f57448d43bcb80acfae3e4562b99) Thanks [@jxom](https://github.com/jxom)! - Fixed sendTransactionSync timeout propagation.

## 2.43.7

### Patch Changes

- [`1199b07b6fcb61f55902a446078ad62d896d50a0`](https://github.com/wevm/viem/commit/1199b07b6fcb61f55902a446078ad62d896d50a0) Thanks [@jxom](https://github.com/jxom)! - Switched to named `ox/tempo` exports.

## 2.43.6

### Patch Changes

- [#4200](https://github.com/wevm/viem/pull/4200) [`88e877233e488ddc2a29582026db3a876d2b5ba6`](https://github.com/wevm/viem/commit/88e877233e488ddc2a29582026db3a876d2b5ba6) Thanks [@Sharqiewicz](https://github.com/Sharqiewicz)! - Added Paseo PassetHub chain.

- [#4209](https://github.com/wevm/viem/pull/4209) [`8654ffcfdc102b10a84d4626e07c251d9f1a55c1`](https://github.com/wevm/viem/commit/8654ffcfdc102b10a84d4626e07c251d9f1a55c1) Thanks [@jxom](https://github.com/jxom)! - Fixed encoding of `paymasterSignature` in `toPackedUserOperation` to use the correct ERC-4337 format with magic suffix and length prefix.

- [#4185](https://github.com/wevm/viem/pull/4185) [`99421a6c53359626394f41e7b310aa3dc14fdc48`](https://github.com/wevm/viem/commit/99421a6c53359626394f41e7b310aa3dc14fdc48) Thanks [@MrSaints](https://github.com/MrSaints)! - Added Codex chain.

## 2.43.5

### Patch Changes

- [#4203](https://github.com/wevm/viem/pull/4203) [`d4875f4c0ffc191ddb1f11b7acae27e928329bff`](https://github.com/wevm/viem/commit/d4875f4c0ffc191ddb1f11b7acae27e928329bff) Thanks [@o-az](https://github.com/o-az)! - Updated Tempo Devnet chain id to 31318

## 2.43.4

### Patch Changes

- [#4194](https://github.com/wevm/viem/pull/4194) [`16b0819efbf535fd8a287921323380c281c697f7`](https://github.com/wevm/viem/commit/16b0819efbf535fd8a287921323380c281c697f7) Thanks [@0xRenji](https://github.com/0xRenji)! - Fixed `getAbiItem` for overloaded tuples with additional child tuple components beyond the number of args

- [#4193](https://github.com/wevm/viem/pull/4193) [`61ee0cece16abf3d63ad9f569ca683ea9586fb9c`](https://github.com/wevm/viem/commit/61ee0cece16abf3d63ad9f569ca683ea9586fb9c) Thanks [@akitothemoon](https://github.com/akitothemoon)! - Added CpChain network.

- [`892ebea16241fd4403c691022297463e2fad2d5b`](https://github.com/wevm/viem/commit/892ebea16241fd4403c691022297463e2fad2d5b) Thanks [@jxom](https://github.com/jxom)! - Fixed `getUserOperationHash` calculation for EIP-7702 UserOperations.

## 2.43.3

### Patch Changes

- [#4188](https://github.com/wevm/viem/pull/4188) [`0e589b25a209943ea939f6ca6e4c5376c89d8e10`](https://github.com/wevm/viem/commit/0e589b25a209943ea939f6ca6e4c5376c89d8e10) Thanks [@jenpaff](https://github.com/jenpaff)! - Fixed tempo formatter for access keys

- [`53f280a72534259d2f6c06d411b10b9077dd0bff`](https://github.com/wevm/viem/commit/53f280a72534259d2f6c06d411b10b9077dd0bff) Thanks [@jxom](https://github.com/jxom)! - Restored behavior where `chain` was not passed as a return value of `prepareTransactionRequest.

- [`6f0e7c2bb902d0f7eff7ffcc0cf0997be9c15c45`](https://github.com/wevm/viem/commit/6f0e7c2bb902d0f7eff7ffcc0cf0997be9c15c45) Thanks [@tmm](https://github.com/tmm)! - Updated tempo chain config

## 2.43.2

### Patch Changes

- [`e3a110394b9775ee2eb4141526b274a5480b25fb`](https://github.com/wevm/viem/commit/e3a110394b9775ee2eb4141526b274a5480b25fb) Thanks [@jxom](https://github.com/jxom)! - Updated Ox.

- [`5087f50f98b3bd74e5bb9483c7e2c46418395a2d`](https://github.com/wevm/viem/commit/5087f50f98b3bd74e5bb9483c7e2c46418395a2d) Thanks [@jxom](https://github.com/jxom)! - Fixed JSON-RPC account formatting for Tempo transactions.

- [#4173](https://github.com/wevm/viem/pull/4173) [`0e8149f9275a6453d52d9847dd02176e7089ce4e`](https://github.com/wevm/viem/commit/0e8149f9275a6453d52d9847dd02176e7089ce4e) Thanks [@sandyup](https://github.com/sandyup)! - Added Apollo mainnet.

- [#4181](https://github.com/wevm/viem/pull/4181) [`cb2bb89abf311eb2de7b506418e28d500087ca91`](https://github.com/wevm/viem/commit/cb2bb89abf311eb2de7b506418e28d500087ca91) Thanks [@albertov19](https://github.com/albertov19)! - Updated Moonbeam/Moonriver RPC URLs.

- [#4179](https://github.com/wevm/viem/pull/4179) [`0c10bf7a50b7eabf97cd23c88263122c79f775cd`](https://github.com/wevm/viem/commit/0c10bf7a50b7eabf97cd23c88263122c79f775cd) Thanks [@findmytrueself](https://github.com/findmytrueself)! - Added HPP Mainnet & Sepolia

- [#4180](https://github.com/wevm/viem/pull/4180) [`f983ce9ad4eb4d53fd9d952e7e1cff4053ae7100`](https://github.com/wevm/viem/commit/f983ce9ad4eb4d53fd9d952e7e1cff4053ae7100) Thanks [@BigtoMantraDev](https://github.com/BigtoMantraDev)! - rename MANTRA DuKong native coin

## 2.43.1

### Patch Changes

- [`28cc8934f1cb9003addb37be681be902a752fa3c`](https://github.com/wevm/viem/commit/28cc8934f1cb9003addb37be681be902a752fa3c) Thanks [@tmm](https://github.com/tmm)! - Updated internal types for named tuples inference

## 2.43.0

### Minor Changes

- [#4107](https://github.com/wevm/viem/pull/4107) [`b423fc17eba4f9f0648f72f5358a8e5ed9d5f092`](https://github.com/wevm/viem/commit/b423fc17eba4f9f0648f72f5358a8e5ed9d5f092) Thanks [@tmm](https://github.com/tmm)! - Added experimental named tuple support for contract-related actions and utilities.

- [#4147](https://github.com/wevm/viem/pull/4147) [`734d99d9da4b76f9aa985a800213b4ba581607df`](https://github.com/wevm/viem/commit/734d99d9da4b76f9aa985a800213b4ba581607df) Thanks [@jxom](https://github.com/jxom)! - Added first-class support and extension for [Tempo](https://docs.tempo.xyz).

  ***

  Attaching a Tempo chain to your client grants your transaction actions with [Tempo superpowers](https://docs.tempo.xyz/protocol/transactions) like batched calls and external fee payer capabilities.

  ```ts
  import { createClient, http } from "viem";
  import { privateKeyToAccount } from "viem/accounts";
  import { tempoTestnet } from "viem/chains";

  const client = createClient({
    account: privateKeyToAccount("0x…"),
    chain: tempoTestnet.extend({
      feeToken: "0x20c00000000000000000000000000000000000fa",
    }),
    transport: http(),
  });

  const receipt = client.sendTransactionSync({
    calls: [
      { data: "0x…", to: "0x…" },
      { data: "0x…", to: "0x…" },
      { data: "0x…", to: "0x…" },
    ],
    feePayer: privateKeyToAccount("0x…"),
  });
  ```

  You can also use Tempo Actions to call to enshrined protocol features like the Stablecoin Token Factory:

  ```ts
  import { createClient, http } from "viem";
  import { privateKeyToAccount } from "viem/accounts";
  import { tempoTestnet } from "viem/chains";
  import { tempoActions } from "viem/tempo";

  const client = createClient({
    account: privateKeyToAccount("0x…"),
    chain: tempoTestnet,
    transport: http(),
  }).extend(tempoActions());

  const { receipt, token } = await client.token.createSync({
    currency: "USD",
    name: "My Company USD",
    symbol: "CUSD",
  });
  ```

### Patch Changes

- [#4168](https://github.com/wevm/viem/pull/4168) [`3ff6c2f19350dcbe49017e2b3d5a2cf761ab9070`](https://github.com/wevm/viem/commit/3ff6c2f19350dcbe49017e2b3d5a2cf761ab9070) Thanks [@albertov19](https://github.com/albertov19)! - Added DataHaven Testnet chain.

- [`aa19d02951f5af26bdcfb472901d940ba446672b`](https://github.com/wevm/viem/commit/aa19d02951f5af26bdcfb472901d940ba446672b) Thanks [@jxom](https://github.com/jxom)! - Added missing /_#**PURE**_/ annotations to chains.

- [`e0ccf5ba210a14ee17df49db90da2b37aa592222`](https://github.com/wevm/viem/commit/e0ccf5ba210a14ee17df49db90da2b37aa592222) Thanks [@jxom](https://github.com/jxom)! - Added support for EntryPoint 0.9 on `toSimple7702SmartAccount`.

- [#4172](https://github.com/wevm/viem/pull/4172) [`9b7d6734c2ac4b6b26f7284842eb685c92a85e8e`](https://github.com/wevm/viem/commit/9b7d6734c2ac4b6b26f7284842eb685c92a85e8e) Thanks [@richiedunk](https://github.com/richiedunk)! - Added Somnia network.

- [#4167](https://github.com/wevm/viem/pull/4167) [`bf53fd1d78de1f5b5658e6d9242a348d1667c565`](https://github.com/wevm/viem/commit/bf53fd1d78de1f5b5658e6d9242a348d1667c565) Thanks [@manuelbarbas](https://github.com/manuelbarbas)! - Added New SKALE Base Chains (Testnet and Mainnet)

- [`4f7db6a9e9eacd4152ddf89c84f019e4b93b70f0`](https://github.com/wevm/viem/commit/4f7db6a9e9eacd4152ddf89c84f019e4b93b70f0) Thanks [@jxom](https://github.com/jxom)! - Added `defineChain#verifyHash` for chain-specific signature verification.

## 2.42.1

### Patch Changes

- [#4162](https://github.com/wevm/viem/pull/4162) [`8f665cdbeae06528b83cdbf9804d621eb0231b82`](https://github.com/wevm/viem/commit/8f665cdbeae06528b83cdbf9804d621eb0231b82) Thanks [@jxom](https://github.com/jxom)! - Fixed WebSocket subscriptions being duplicated after reconnection when unwatching and rewatching.

- [#4164](https://github.com/wevm/viem/pull/4164) [`85b4f81fc73bb3217c4ad1e25e75c147ff2aa037`](https://github.com/wevm/viem/commit/85b4f81fc73bb3217c4ad1e25e75c147ff2aa037) Thanks [@jxom](https://github.com/jxom)! - Fixed `createCursor` throwing when `bytes.buffer` is undefined in React Native environments.

- [#4149](https://github.com/wevm/viem/pull/4149) [`3b91dc2624780eef4798485f3b44ac9e46c69906`](https://github.com/wevm/viem/commit/3b91dc2624780eef4798485f3b44ac9e46c69906) Thanks [@vriveraPeersyst](https://github.com/vriveraPeersyst)! - Added XRPL EVM.

- [`b01e624f67c3cfa5205dbf09be14f86892529b26`](https://github.com/wevm/viem/commit/b01e624f67c3cfa5205dbf09be14f86892529b26) Thanks [@jxom](https://github.com/jxom)! - Fixed `waitForUserOperationReceipt` timeout not being respected.

- [#4155](https://github.com/wevm/viem/pull/4155) [`ea6805fd92757cec795d47cd04b24310464508dd`](https://github.com/wevm/viem/commit/ea6805fd92757cec795d47cd04b24310464508dd) Thanks [@sanketsaagar](https://github.com/sanketsaagar)! - Fixed Polygon Amoy and Mainnet explorer API URLs.

- [#4157](https://github.com/wevm/viem/pull/4157) [`8105d1e10a96c1f608ec10ed333433ac766a7615`](https://github.com/wevm/viem/commit/8105d1e10a96c1f608ec10ed333433ac766a7615) Thanks [@jxom](https://github.com/jxom)! - Added `blockTimestamp` to `Log` type.

## 2.42.0

### Minor Changes

- [#4134](https://github.com/wevm/viem/pull/4134) [`d9d666beeccf748157d1292849f5a0d18768baf7`](https://github.com/wevm/viem/commit/d9d666beeccf748157d1292849f5a0d18768baf7) Thanks [@mikelxc](https://github.com/mikelxc)! - Added EntryPoint v0.9 support for Account Abstraction (ERC-4337).
  - Added `entryPoint09Abi` and `entryPoint09Address` constants
  - Added `'0.9'` to `EntryPointVersion` type
  - Added `UserOperation<'0.9'>` with new `paymasterSignature` field for parallelizable paymaster signing
  - Updated `getUserOperationHash` to support v0.9 (uses EIP-712 typed data like v0.8)
  - Updated `toPackedUserOperation` to handle `paymasterSignature`
  - Updated `prepareUserOperation` type definitions for v0.9

### Patch Changes

- [#4145](https://github.com/wevm/viem/pull/4145) [`6104df73f8f38b55dc04174523ade8f25436f6da`](https://github.com/wevm/viem/commit/6104df73f8f38b55dc04174523ade8f25436f6da) Thanks [@myronrotter](https://github.com/myronrotter)! - Added Taiko Hoodi Testnet.

- [#4144](https://github.com/wevm/viem/pull/4144) [`6e6543861d95f8ebf6167a077dce39f1fe6febfa`](https://github.com/wevm/viem/commit/6e6543861d95f8ebf6167a077dce39f1fe6febfa) Thanks [@chawyehsu](https://github.com/chawyehsu)! - Add Stable Testnet

- [#4137](https://github.com/wevm/viem/pull/4137) [`97cec97451ff88ddaebf3b2a2a10fdb81e28b0da`](https://github.com/wevm/viem/commit/97cec97451ff88ddaebf3b2a2a10fdb81e28b0da) Thanks [@akitothemoon](https://github.com/akitothemoon)! - Added Henesys network.

- [#4138](https://github.com/wevm/viem/pull/4138) [`cf7bcc86422c32d70023e196dc2a85f6ad690b27`](https://github.com/wevm/viem/commit/cf7bcc86422c32d70023e196dc2a85f6ad690b27) Thanks [@ihooni](https://github.com/ihooni)! - Support preconf for GIWA testnet

## 2.41.2

### Patch Changes

- [`be9879ff69eb9b7526878b18c32ead9eeb9f5335`](https://github.com/wevm/viem/commit/be9879ff69eb9b7526878b18c32ead9eeb9f5335) Thanks [@jxom](https://github.com/jxom)! - Added preference to use chain-specific prepared transaction nonce.

## 2.41.1

### Patch Changes

- [`e6cfa651b28c2c059f42cd250f7191262d121fbe`](https://github.com/wevm/viem/commit/e6cfa651b28c2c059f42cd250f7191262d121fbe) Thanks [@jxom](https://github.com/jxom)! - Removed redundant OP Stack gas estimations

## 2.41.0

### Minor Changes

- [`fee56f5e9f0f66dc3c6cb52b891e933dde044410`](https://github.com/wevm/viem/commit/fee56f5e9f0f66dc3c6cb52b891e933dde044410) Thanks [@jxom](https://github.com/jxom)! - Added `chain.prepareTransactionRequest` config that allows chain-specifc transaction preparation logic.

### Patch Changes

- [`1bda14ca5dd5d4bdcf0e0a9117ccc34ea7da64c9`](https://github.com/wevm/viem/commit/1bda14ca5dd5d4bdcf0e0a9117ccc34ea7da64c9) Thanks [@jxom](https://github.com/jxom)! - Added optimization to check if `eth_fillTransaction` needs to be called.

## 2.40.4

### Patch Changes

- [#3950](https://github.com/wevm/viem/pull/3950) [`f73a2c959ff215856b7b56f60b4093e430d81e44`](https://github.com/wevm/viem/commit/f73a2c959ff215856b7b56f60b4093e430d81e44) Thanks [@Kemperino](https://github.com/Kemperino)! - Added estimateOperatorFee action for OP Stack chains

- [#4125](https://github.com/wevm/viem/pull/4125) [`a73183f305e9ea5f45a3f3742d110f34501a79ac`](https://github.com/wevm/viem/commit/a73183f305e9ea5f45a3f3742d110f34501a79ac) Thanks [@sandyup](https://github.com/sandyup)! - Added Reactive Lasna Testnet.

## 2.40.3

### Patch Changes

- [#4119](https://github.com/wevm/viem/pull/4119) [`9b89137fa523fb0a7ab5afcef477375b6de9a86d`](https://github.com/wevm/viem/commit/9b89137fa523fb0a7ab5afcef477375b6de9a86d) Thanks [@jxom](https://github.com/jxom)! - Fixed an issue where a `nonceManager` would unexpectedly consume a nonce if `eth_fillTransaction` is not supported.

## 2.40.2

### Patch Changes

- [`73f5e468b57862250529be1233c39dee7520df20`](https://github.com/wevm/viem/commit/73f5e468b57862250529be1233c39dee7520df20) Thanks [@jxom](https://github.com/jxom)! - Added `getAction` support to `verifyMessage` and `verifyTypedData`.

## 2.40.1

### Patch Changes

- [`6a2013d88b6eedc9420ce3fea86af530842f1787`](https://github.com/wevm/viem/commit/6a2013d88b6eedc9420ce3fea86af530842f1787) Thanks [@jxom](https://github.com/jxom)! - Fixed `sendTransactionSync` generic.

- [`4dca806057cb83152a3f1fbd3df31f730eb93eea`](https://github.com/wevm/viem/commit/4dca806057cb83152a3f1fbd3df31f730eb93eea) Thanks [@jxom](https://github.com/jxom)! - Added `hyperliquid` chain.

## 2.40.0

### Minor Changes

- [#4098](https://github.com/wevm/viem/pull/4098) [`003b231361f223487aa3e6a67a1e5258e8fe758b`](https://github.com/wevm/viem/commit/003b231361f223487aa3e6a67a1e5258e8fe758b) Thanks [@jxom](https://github.com/jxom)! - Hooked up `eth_fillTransaction` routing to `prepareTransactionRequest`, to reduce the RPC calls required to prepare a local transaction from 3-4, to 1 (if `eth_fillTransaction` is supported by the execution node).

- [#4098](https://github.com/wevm/viem/pull/4098) [`003b231361f223487aa3e6a67a1e5258e8fe758b`](https://github.com/wevm/viem/commit/003b231361f223487aa3e6a67a1e5258e8fe758b) Thanks [@jxom](https://github.com/jxom)! - Added `fillTransaction` action for `eth_fillTransaction` support.

### Patch Changes

- [#4069](https://github.com/wevm/viem/pull/4069) [`b46fbe33a45faa9c645fddadfd59d7660b12615c`](https://github.com/wevm/viem/commit/b46fbe33a45faa9c645fddadfd59d7660b12615c) Thanks [@bearpong](https://github.com/bearpong)! - Added `url` property to request errors.

- [#4109](https://github.com/wevm/viem/pull/4109) [`40132ab1a9dc4583685b7e1a77368cad953f917d`](https://github.com/wevm/viem/commit/40132ab1a9dc4583685b7e1a77368cad953f917d) Thanks [@keone](https://github.com/keone)! - Updated Monad block explorer URL and added WebSocket URLs, Multicall3 contract, second block explorer, and second RPC URL.

- [#4110](https://github.com/wevm/viem/pull/4110) [`90ada93230446875bd2ada289f2b83f4d3a58816`](https://github.com/wevm/viem/commit/90ada93230446875bd2ada289f2b83f4d3a58816) Thanks [@ikautak](https://github.com/ikautak)! - Added `passphrase` option to `mnemonicToAccount`.

## 2.39.3

### Patch Changes

- [#4099](https://github.com/wevm/viem/pull/4099) [`7e060c65427613fc1f847cda6b3231483e268a44`](https://github.com/wevm/viem/commit/7e060c65427613fc1f847cda6b3231483e268a44) Thanks [@QEDK](https://github.com/QEDK)! - Added Monad mainnet.

- [#4100](https://github.com/wevm/viem/pull/4100) [`987e5415b0052cbe0b79e3780754c8ec1cf5db2f`](https://github.com/wevm/viem/commit/987e5415b0052cbe0b79e3780754c8ec1cf5db2f) Thanks [@sandyup](https://github.com/sandyup)! - Added Etherlink Shadownet Testnet.

## 2.39.2

### Patch Changes

- [`4fbaf70de4e483891451ea9549a0f7e7b30b2bfe`](https://github.com/wevm/viem/commit/4fbaf70de4e483891451ea9549a0f7e7b30b2bfe) Thanks [@jxom](https://github.com/jxom)! - Added support for `Uint8Array` on `hashStruct`.

## 2.39.1

### Patch Changes

- [#4086](https://github.com/wevm/viem/pull/4086) [`add94c47c3960beccb6a981dfb3c35a21c44f6b4`](https://github.com/wevm/viem/commit/add94c47c3960beccb6a981dfb3c35a21c44f6b4) Thanks [@kyonRay](https://github.com/kyonRay)! - Added POTOS Testnet.

- [#4088](https://github.com/wevm/viem/pull/4088) [`d2855cc99422361e0513d250997da7862b160a88`](https://github.com/wevm/viem/commit/d2855cc99422361e0513d250997da7862b160a88) Thanks [@akitothemoon](https://github.com/akitothemoon)! - Added Jasmy Chain.

- [#4092](https://github.com/wevm/viem/pull/4092) [`8d24f14e1da493a003b17252a3e66e067df75c3b`](https://github.com/wevm/viem/commit/8d24f14e1da493a003b17252a3e66e067df75c3b) Thanks [@spalladino](https://github.com/spalladino)! - Added handling of nethermind execution reverted error.

- [`71ad615bff67d56481e3bb6188439223f06ca055`](https://github.com/wevm/viem/commit/71ad615bff67d56481e3bb6188439223f06ca055) Thanks [@jxom](https://github.com/jxom)! - Added `account` as a transport config parameter.

## 2.39.0

### Minor Changes

- [`c348b3e3f261503aea0ce684ecce31002c06ca94`](https://github.com/wevm/viem/commit/c348b3e3f261503aea0ce684ecce31002c06ca94) Thanks [@jxom](https://github.com/jxom)! - Added `sender` and `nonce` properties to `getTransaction` to support `eth_getTransactionBySenderAndNonce`.

### Patch Changes

- [#4058](https://github.com/wevm/viem/pull/4058) [`eb5fb8894ca982dcb2f2e30e3be1c8953afeb799`](https://github.com/wevm/viem/commit/eb5fb8894ca982dcb2f2e30e3be1c8953afeb799) Thanks [@tuphan-dn](https://github.com/tuphan-dn)! - Fixed a bug where the timeout in `waitForUserOperationReceipt` was not properly cleared after the receipt was returned.

- [#4074](https://github.com/wevm/viem/pull/4074) [`7d88fcdc0a91a445863e28d0c3fca0ec606e7a00`](https://github.com/wevm/viem/commit/7d88fcdc0a91a445863e28d0c3fca0ec606e7a00) Thanks [@askmyselfwhy](https://github.com/askmyselfwhy)! - Added Helios Testnet.

- [#4081](https://github.com/wevm/viem/pull/4081) [`9172f8cf92d7b23c3e82bfffba076d4eacad7108`](https://github.com/wevm/viem/commit/9172f8cf92d7b23c3e82bfffba076d4eacad7108) Thanks [@sandyup](https://github.com/sandyup)! - Added Silent Data Mainnet.

- [#4080](https://github.com/wevm/viem/pull/4080) [`2bfa29ea935d3be6fec17dfb75c9baf303504a46`](https://github.com/wevm/viem/commit/2bfa29ea935d3be6fec17dfb75c9baf303504a46) Thanks [@antonimmo](https://github.com/antonimmo)! - Updated ApeChain name.

- [#4073](https://github.com/wevm/viem/pull/4073) [`cfdb8b329313ca70c0aa7c7f5805d55547869e72`](https://github.com/wevm/viem/commit/cfdb8b329313ca70c0aa7c7f5805d55547869e72) Thanks [@akitothemoon](https://github.com/akitothemoon)! - Added POTOS Mainnet.

- [#4068](https://github.com/wevm/viem/pull/4068) [`b0ab1c2faf47a795656e1189957f8491b255976b`](https://github.com/wevm/viem/commit/b0ab1c2faf47a795656e1189957f8491b255976b) Thanks [@mangosago99](https://github.com/mangosago99)! - Added Xone mainnet and testnet.

## 2.38.6

### Patch Changes

- [#4064](https://github.com/wevm/viem/pull/4064) [`9bccdb2cb445270833468c1c273d6e0f2c1dbdf7`](https://github.com/wevm/viem/commit/9bccdb2cb445270833468c1c273d6e0f2c1dbdf7) Thanks [@coffeexcoin](https://github.com/coffeexcoin)! - Added `blockTime` for `abstract`, `abstractTestnet`, `sophon`, `sophonTestnet`, `zksync`, `zksyncSepoliaTestnet`.

- [#4061](https://github.com/wevm/viem/pull/4061) [`7efb234a7396002b1a911ff4bfbd809c76d3acc1`](https://github.com/wevm/viem/commit/7efb234a7396002b1a911ff4bfbd809c76d3acc1) Thanks [@Blessing-Circle](https://github.com/Blessing-Circle)! - Added Arc Testnet chain.

## 2.38.5

### Patch Changes

- [#4056](https://github.com/wevm/viem/pull/4056) [`320895cf0e6c654b419d8d61a59c4e7b46674368`](https://github.com/wevm/viem/commit/320895cf0e6c654b419d8d61a59c4e7b46674368) Thanks [@sandyup](https://github.com/sandyup)! - Added Nomina mainnet.

- [#4055](https://github.com/wevm/viem/pull/4055) [`2f933fb8ab20c63b8e777d1819fdd80f9b9a8715`](https://github.com/wevm/viem/commit/2f933fb8ab20c63b8e777d1819fdd80f9b9a8715) Thanks [@sandyup](https://github.com/sandyup)! - Removed trailing whitespace from PGN chain name.

- [#4049](https://github.com/wevm/viem/pull/4049) [`f12376ca95436fe05f7fe7bc411441bc0f02c8da`](https://github.com/wevm/viem/commit/f12376ca95436fe05f7fe7bc411441bc0f02c8da) Thanks [@hejtao](https://github.com/hejtao)! - Added 0g testnet.

## 2.38.4

### Patch Changes

- [#4038](https://github.com/wevm/viem/pull/4038) [`042bf3963a7435adc1044a61df03cd65f31eeac9`](https://github.com/wevm/viem/commit/042bf3963a7435adc1044a61df03cd65f31eeac9) Thanks [@cuzfinal](https://github.com/cuzfinal)! - Updated hashkeyChainTestnet config

- [`97fad54d7d6248686a7767e9ac49b8ecc60d54f8`](https://github.com/wevm/viem/commit/97fad54d7d6248686a7767e9ac49b8ecc60d54f8) Thanks [@jxom](https://github.com/jxom)! - Passed `account` to transaction request formatters.

- [#4047](https://github.com/wevm/viem/pull/4047) [`0d9222968b1dda76fd2efc3d3c64c745955d4240`](https://github.com/wevm/viem/commit/0d9222968b1dda76fd2efc3d3c64c745955d4240) Thanks [@akitothemoon](https://github.com/akitothemoon)! - Added Quai network.

- [#4042](https://github.com/wevm/viem/pull/4042) [`0044d12bf123cc990caf4463fe3cae237bf34d2e`](https://github.com/wevm/viem/commit/0044d12bf123cc990caf4463fe3cae237bf34d2e) Thanks [@saqibhafeezkhan](https://github.com/saqibhafeezkhan)! - Added Gatechain Mainnet

## 2.38.3

### Patch Changes

- [#4028](https://github.com/wevm/viem/pull/4028) [`7485281108420d422bd36cffa2ff1c8e7294423d`](https://github.com/wevm/viem/commit/7485281108420d422bd36cffa2ff1c8e7294423d) Thanks [@tnunamak](https://github.com/tnunamak)! - Added Vana and Vana Moksha Testnet chains.

- [#4034](https://github.com/wevm/viem/pull/4034) [`de8f2f01f222b8e5dcea3689838ea1f452a8383b`](https://github.com/wevm/viem/commit/de8f2f01f222b8e5dcea3689838ea1f452a8383b) Thanks [@sandyup](https://github.com/sandyup)! - Added Surge Testnet.

- [#4032](https://github.com/wevm/viem/pull/4032) [`fdc1baf3257c9744738d070fa57da6bf2547172b`](https://github.com/wevm/viem/commit/fdc1baf3257c9744738d070fa57da6bf2547172b) Thanks [@boredland](https://github.com/boredland)! - Added `blockTime` property to Polygon.

- [#4033](https://github.com/wevm/viem/pull/4033) [`5601fc11189948f2e3ac6fef88da9fd3a25e825d`](https://github.com/wevm/viem/commit/5601fc11189948f2e3ac6fef88da9fd3a25e825d) Thanks [@boredland](https://github.com/boredland)! - Added `blockTime` property to Scroll chain.

- [#4027](https://github.com/wevm/viem/pull/4027) [`1fc791c7d003a8f76ca0c71c47dd0414ff72b0b7`](https://github.com/wevm/viem/commit/1fc791c7d003a8f76ca0c71c47dd0414ff72b0b7) Thanks [@boredland](https://github.com/boredland)! - Added `blockTime` property to Linea.

- [#4017](https://github.com/wevm/viem/pull/4017) [`f27860fbd61c1d324ac1c8d85bf14fb4354c96ec`](https://github.com/wevm/viem/commit/f27860fbd61c1d324ac1c8d85bf14fb4354c96ec) Thanks [@GiovaniGuizzo](https://github.com/GiovaniGuizzo)! - Added Kii Testnet Oro chain.

- [#4031](https://github.com/wevm/viem/pull/4031) [`12f0a4443716fdc5616cc8641c8bcfabdd61e531`](https://github.com/wevm/viem/commit/12f0a4443716fdc5616cc8641c8bcfabdd61e531) Thanks [@boredland](https://github.com/boredland)! - Added `blockTime` to Plasma chain.

## 2.38.2

### Patch Changes

- [#4018](https://github.com/wevm/viem/pull/4018) [`f56feac59540721ed51da3bfc4386909177403cd`](https://github.com/wevm/viem/commit/f56feac59540721ed51da3bfc4386909177403cd) Thanks [@jxom](https://github.com/jxom)! - Added `throwOnReceiptRevert` property to `sendTransactionSync`, `writeContractSync`, `sendRawTransactionSync`.

## 2.38.1

### Patch Changes

- [#4011](https://github.com/wevm/viem/pull/4011) [`127124e4a6747a083bdfc6628148bf70dace2cfb`](https://github.com/wevm/viem/commit/127124e4a6747a083bdfc6628148bf70dace2cfb) Thanks [@akitothemoon](https://github.com/akitothemoon)! - Added Injective network.

- [#4008](https://github.com/wevm/viem/pull/4008) [`ac6206b771336086289d30195a716be68efb5e04`](https://github.com/wevm/viem/commit/ac6206b771336086289d30195a716be68efb5e04) Thanks [@johanneskares](https://github.com/johanneskares)! - Added Trust Wallet Support for `sendCalls` with `experimental_fallback`.

## 2.38.0

### Minor Changes

- [#3989](https://github.com/wevm/viem/pull/3989) [`2b254aa650411285c74dc8caa01a6a4e096e9915`](https://github.com/wevm/viem/commit/2b254aa650411285c74dc8caa01a6a4e096e9915) Thanks [@jxom](https://github.com/jxom)! - Added `sendTransactionSync`, `sendRawTransactionSync`, `writeContractSync`, `sendCallsSync`.

## 2.37.13

### Patch Changes

- [#4003](https://github.com/wevm/viem/pull/4003) [`4bc1803f76fd1d935982a20f558926f4c8417014`](https://github.com/wevm/viem/commit/4bc1803f76fd1d935982a20f558926f4c8417014) Thanks [@yumartins](https://github.com/yumartins)! - Added Nitrograph Testnet chain.

- [`4376837b38d2d2a2c9b44e4955fadbdb75c13a74`](https://github.com/wevm/viem/commit/4376837b38d2d2a2c9b44e4955fadbdb75c13a74) Thanks [@jxom](https://github.com/jxom)! - Simplify `account#signTransaction` interface.

- [#3993](https://github.com/wevm/viem/pull/3993) [`a57ff1b6010a087d986320d3e5c50cca9dded93c`](https://github.com/wevm/viem/commit/a57ff1b6010a087d986320d3e5c50cca9dded93c) Thanks [@simbadMarino](https://github.com/simbadMarino)! - Added TRON Nile testnet chain

- [#3996](https://github.com/wevm/viem/pull/3996) [`b8915c0be63c87e75225fb716631e913b0131d09`](https://github.com/wevm/viem/commit/b8915c0be63c87e75225fb716631e913b0131d09) Thanks [@sandyup](https://github.com/sandyup)! - Added Doma Testnet.

- [#3990](https://github.com/wevm/viem/pull/3990) [`3d6ea4ea07323ac3f2bed91ab4c33ded5e23b6d1`](https://github.com/wevm/viem/commit/3d6ea4ea07323ac3f2bed91ab4c33ded5e23b6d1) Thanks [@aaronmgdr](https://github.com/aaronmgdr)! - Deprecated `celoAlfajores`.

## 2.37.12

### Patch Changes

- [#3997](https://github.com/wevm/viem/pull/3997) [`0abb1d104e9464523ee83f1bc5136ebdae1dc2da`](https://github.com/wevm/viem/commit/0abb1d104e9464523ee83f1bc5136ebdae1dc2da) Thanks [@jxom](https://github.com/jxom)! - Tweaked `TransactionSerializable` & `TransactionRequest` types to be more symmetric.

- [#3997](https://github.com/wevm/viem/pull/3997) [`0abb1d104e9464523ee83f1bc5136ebdae1dc2da`](https://github.com/wevm/viem/commit/0abb1d104e9464523ee83f1bc5136ebdae1dc2da) Thanks [@jxom](https://github.com/jxom)! - Added `action` parameter to formatters.

## 2.37.11

### Patch Changes

- [`cce7f03ea0c05c6ec4840cd4221e58cf7d7b5ab1`](https://github.com/wevm/viem/commit/cce7f03ea0c05c6ec4840cd4221e58cf7d7b5ab1) Thanks [@jxom](https://github.com/jxom)! - Added support for async `serializer` on `signTransaction`.

## 2.37.10

### Patch Changes

- [#3984](https://github.com/wevm/viem/pull/3984) [`18a482b048237df5a5af822f483ed55be90ba63f`](https://github.com/wevm/viem/commit/18a482b048237df5a5af822f483ed55be90ba63f) Thanks [@ihooni](https://github.com/ihooni)! - Added GIWA Sepolia chain.

- [#3985](https://github.com/wevm/viem/pull/3985) [`1e791ad6aeebcd9a8dd4ad7e95f7d0690fa5949b`](https://github.com/wevm/viem/commit/1e791ad6aeebcd9a8dd4ad7e95f7d0690fa5949b) Thanks [@pazernykormoran](https://github.com/pazernykormoran)! - Added `blockTime` to Gnosis chains.

## 2.37.9

### Patch Changes

- [#3980](https://github.com/wevm/viem/pull/3980) [`912509b2a03072b81af0f5f0f723dca1996e0635`](https://github.com/wevm/viem/commit/912509b2a03072b81af0f5f0f723dca1996e0635) Thanks [@xzilja](https://github.com/xzilja)! - Added multicall3 contracts to Plasma.

- [#3981](https://github.com/wevm/viem/pull/3981) [`204cf427cd93cfa6e89bba84999a1e5019ba09df`](https://github.com/wevm/viem/commit/204cf427cd93cfa6e89bba84999a1e5019ba09df) Thanks [@maxandron](https://github.com/maxandron)! - Fixed handling of empty websocket messages from Erigon clients

- [#3971](https://github.com/wevm/viem/pull/3971) [`ddd870e616a5af1fe78b94b27c793294b07f384e`](https://github.com/wevm/viem/commit/ddd870e616a5af1fe78b94b27c793294b07f384e) Thanks [@akitothemoon](https://github.com/akitothemoon)! - Added Jovay Mainnet & Testnet.

- [#3974](https://github.com/wevm/viem/pull/3974) [`3ecda3b5aadee0d6ec63c8ed1248d05add39e07a`](https://github.com/wevm/viem/commit/3ecda3b5aadee0d6ec63c8ed1248d05add39e07a) Thanks [@xylophonez](https://github.com/xylophonez)! - Deprecated `weaveVMAlphanet` chain.
  Added `loadAlphanet` chain.

## 2.37.8

### Patch Changes

- [#3959](https://github.com/wevm/viem/pull/3959) [`20b10d7e1862583780f2b760289801308c2466f7`](https://github.com/wevm/viem/commit/20b10d7e1862583780f2b760289801308c2466f7) Thanks [@BigtoMantraDev](https://github.com/BigtoMantraDev)! - Added MANTRA EVM.

- [`b0855ac06666199ac5a53f1aa6f776e30a380bf9`](https://github.com/wevm/viem/commit/b0855ac06666199ac5a53f1aa6f776e30a380bf9) Thanks [@jxom](https://github.com/jxom)! - Added `id` to JSON-RPC payload for WebSocket pings.

- [#3964](https://github.com/wevm/viem/pull/3964) [`4683cbda6b98592f432879df1398a55317683f30`](https://github.com/wevm/viem/commit/4683cbda6b98592f432879df1398a55317683f30) Thanks [@hejtao](https://github.com/hejtao)! - Added 0g Mainnet and Testnet.

- [#3962](https://github.com/wevm/viem/pull/3962) [`fdf3d59cd788f11dd92d22ec330d5ab246b66fa0`](https://github.com/wevm/viem/commit/fdf3d59cd788f11dd92d22ec330d5ab246b66fa0) Thanks [@Yutaro-Mori-eng](https://github.com/Yutaro-Mori-eng)! - Added Sova mainnet.

## 2.37.7

### Patch Changes

- [`768a11055ad9a4ad47e1ba118545f2f0294fb19b`](https://github.com/wevm/viem/commit/768a11055ad9a4ad47e1ba118545f2f0294fb19b) Thanks [@jxom](https://github.com/jxom)! - Removed manual `authorizationList` gas.

- [#3958](https://github.com/wevm/viem/pull/3958) [`52ac3ffb99922c5362058a570466e04c401a0630`](https://github.com/wevm/viem/commit/52ac3ffb99922c5362058a570466e04c401a0630) Thanks [@Yutaro-Mori-eng](https://github.com/Yutaro-Mori-eng)! - Added ENI Mainnet & Testnet.

- [#3949](https://github.com/wevm/viem/pull/3949) [`dffbdc2762d776f90317b4e191e1631a4df8df3a`](https://github.com/wevm/viem/commit/dffbdc2762d776f90317b4e191e1631a4df8df3a) Thanks [@mmabbasi77](https://github.com/mmabbasi77)! - Added ICB Network chain.

- [#3952](https://github.com/wevm/viem/pull/3952) [`9cf65b7fe846c0755bdd8bf3b0d820e0d7623986`](https://github.com/wevm/viem/commit/9cf65b7fe846c0755bdd8bf3b0d820e0d7623986) Thanks [@jeffgeudens](https://github.com/jeffgeudens)! - Added Botanix chain and modified Botanix Testnet

## 2.37.6

### Patch Changes

- [#3942](https://github.com/wevm/viem/pull/3942) [`4f63629c8b8cb1715159676c15ccce94028afb74`](https://github.com/wevm/viem/commit/4f63629c8b8cb1715159676c15ccce94028afb74) Thanks [@UsmannK](https://github.com/UsmannK)! - Updated `plasmaTestnet` explorer.

- [#3934](https://github.com/wevm/viem/pull/3934) [`7074189a2e636f5de322c46cf0437e9e0a0f8ddd`](https://github.com/wevm/viem/commit/7074189a2e636f5de322c46cf0437e9e0a0f8ddd) Thanks [@3commascapital](https://github.com/3commascapital)! - Added `blockTime` to pulsechain networks.

## 2.37.5

### Patch Changes

- [#3935](https://github.com/wevm/viem/pull/3935) [`1a85c7a9bdd4a1319d6940b5b6f2d84c7c997611`](https://github.com/wevm/viem/commit/1a85c7a9bdd4a1319d6940b5b6f2d84c7c997611) Thanks [@sandyup](https://github.com/sandyup)! - Added Plasma Devnet.

- [#3922](https://github.com/wevm/viem/pull/3922) [`06673e0a6ac6284f9d9897d8f84816978c2187dd`](https://github.com/wevm/viem/commit/06673e0a6ac6284f9d9897d8f84816978c2187dd) Thanks [@cruzdanilo](https://github.com/cruzdanilo)! - Added support for `blockOverrides` on `readContract`.

- [#3922](https://github.com/wevm/viem/pull/3922) [`06673e0a6ac6284f9d9897d8f84816978c2187dd`](https://github.com/wevm/viem/commit/06673e0a6ac6284f9d9897d8f84816978c2187dd) Thanks [@cruzdanilo](https://github.com/cruzdanilo)! - Added support for `blockOverrides` on `multicall`.

## 2.37.4

### Patch Changes

- [#3921](https://github.com/wevm/viem/pull/3921) [`fbd71b713fc38c07aad3004f99f938cac94d2210`](https://github.com/wevm/viem/commit/fbd71b713fc38c07aad3004f99f938cac94d2210) Thanks [@mattw09](https://github.com/mattw09)! - Added Plasma chain.

- [#3925](https://github.com/wevm/viem/pull/3925) [`54be8905faa661e67ff374c7d2da3ef79b7463b9`](https://github.com/wevm/viem/commit/54be8905faa661e67ff374c7d2da3ef79b7463b9) Thanks [@Yutaro-Mori-eng](https://github.com/Yutaro-Mori-eng)! - Added Tea Sepolia.

- [#3928](https://github.com/wevm/viem/pull/3928) [`68b0c109df2773a147cd4a293f738983402538e1`](https://github.com/wevm/viem/commit/68b0c109df2773a147cd4a293f738983402538e1) Thanks [@fubhy](https://github.com/fubhy)! - Tweaked `watchBlockNumber` to work with genesis blocks

- [#3927](https://github.com/wevm/viem/pull/3927) [`b34a0654de59e9fbb6d66661851fb81414e4c558`](https://github.com/wevm/viem/commit/b34a0654de59e9fbb6d66661851fb81414e4c558) Thanks [@moonhee0507](https://github.com/moonhee0507)! - Added Creditcoin Devnet chain.

## 2.37.3

### Patch Changes

- [`fb8bbc87ea3be7a0df70cc7784d58a0d3ad22a28`](https://github.com/wevm/viem/commit/fb8bbc87ea3be7a0df70cc7784d58a0d3ad22a28) Thanks [@jxom](https://github.com/jxom)! - Added `verifyHash` to public decorators.

## 2.37.2

### Patch Changes

- [#3916](https://github.com/wevm/viem/pull/3916) [`7196b6ce7ebd67c00540de8d3d96484e1b84f798`](https://github.com/wevm/viem/commit/7196b6ce7ebd67c00540de8d3d96484e1b84f798) Thanks [@chybisov](https://github.com/chybisov)! - Added `getAction` to `waitForCallsStatus`.

- [#3918](https://github.com/wevm/viem/pull/3918) [`e72d35631d5dd5c35730f7d7c914d8bc649762b2`](https://github.com/wevm/viem/commit/e72d35631d5dd5c35730f7d7c914d8bc649762b2) Thanks [@wobsoriano](https://github.com/wobsoriano)! - Bumped `abitype` to `1.1.0`.

- [#3917](https://github.com/wevm/viem/pull/3917) [`d4104d3b545371ddeeeaacab703cff6fe1570e45`](https://github.com/wevm/viem/commit/d4104d3b545371ddeeeaacab703cff6fe1570e45) Thanks [@coffeexcoin](https://github.com/coffeexcoin)! - Added `fetchFn` to `http` transport.

- [`da117f66d73c3e9bc65a83931495877930f4ed2e`](https://github.com/wevm/viem/commit/da117f66d73c3e9bc65a83931495877930f4ed2e) Thanks [@jxom](https://github.com/jxom)! - Replaced `portalAbi` with `portal2Abi` in `proveWithdrawal`

- [#3907](https://github.com/wevm/viem/pull/3907) [`014aad66bbf0171b144e95d6ecbaa860af87ab59`](https://github.com/wevm/viem/commit/014aad66bbf0171b144e95d6ecbaa860af87ab59) Thanks [@Eteriaio](https://github.com/Eteriaio)! - Added Eteria chain.

## 2.37.1

### Patch Changes

- [`f3b2d7352d352be06e87d146ab6ac3008a21bca3`](https://github.com/wevm/viem/commit/f3b2d7352d352be06e87d146ab6ac3008a21bca3) Thanks [@jxom](https://github.com/jxom)! - Prefer named `ox` imports.

## 2.37.0

### Minor Changes

- [#3905](https://github.com/wevm/viem/pull/3905) [`f134e8e20415986573d88dbf2a1c8cf0327c8b5a`](https://github.com/wevm/viem/commit/f134e8e20415986573d88dbf2a1c8cf0327c8b5a) Thanks [@jxom](https://github.com/jxom)! - Added support for [ERC-8010: Pre-delegated Signature Verification](https://github.com/ethereum/ERCs/pull/1186).

## 2.36.1

### Patch Changes

- [#3892](https://github.com/wevm/viem/pull/3892) [`32f10d5fa330134f5248d8cb8efbd78e8172fb95`](https://github.com/wevm/viem/commit/32f10d5fa330134f5248d8cb8efbd78e8172fb95) Thanks [@fe-dudu](https://github.com/fe-dudu)! - Updated Creditcoin chain name.

- [#3895](https://github.com/wevm/viem/pull/3895) [`30d80c216d7a6fc84881f3877a8950d1d71c9bd7`](https://github.com/wevm/viem/commit/30d80c216d7a6fc84881f3877a8950d1d71c9bd7) Thanks [@coffeexcoin](https://github.com/coffeexcoin)! - Added `fetchFn` parameter to `http` transport configuration.

- [`c83a5e119635d6f82c6cc4b453f051504437d3b3`](https://github.com/wevm/viem/commit/c83a5e119635d6f82c6cc4b453f051504437d3b3) Thanks [@jxom](https://github.com/jxom)! - Fixed `getAssets` aggregation duplicates.

- [#3904](https://github.com/wevm/viem/pull/3904) [`06e29d5fb636ecf2681e1699cbd1518c91c7a16c`](https://github.com/wevm/viem/commit/06e29d5fb636ecf2681e1699cbd1518c91c7a16c) Thanks [@Yutaro-Mori-eng](https://github.com/Yutaro-Mori-eng)! - Added OpenLedger mainnet.

- [`37b8a437cf3803b7a3e00056acf4db38b7e27fef`](https://github.com/wevm/viem/commit/37b8a437cf3803b7a3e00056acf4db38b7e27fef) Thanks [@jxom](https://github.com/jxom)! - Updated dependencies.

- [#3898](https://github.com/wevm/viem/pull/3898) [`c261db9b533cc19796216c88b30d3a19accd0ca8`](https://github.com/wevm/viem/commit/c261db9b533cc19796216c88b30d3a19accd0ca8) Thanks [@b-tarczynski](https://github.com/b-tarczynski)! - Added `blockTime` to Unichain.

- [#3896](https://github.com/wevm/viem/pull/3896) [`de5fccf43cc509c961c3b2ca44343224278f7ca4`](https://github.com/wevm/viem/commit/de5fccf43cc509c961c3b2ca44343224278f7ca4) Thanks [@iamshvetsov](https://github.com/iamshvetsov)! - Added support for CrossFi

## 2.36.0

### Minor Changes

- [#3883](https://github.com/wevm/viem/pull/3883) [`4758e2ca5ba8a91bec4da9fa952d9e9b920c045d`](https://github.com/wevm/viem/commit/4758e2ca5ba8a91bec4da9fa952d9e9b920c045d) Thanks [@jxom](https://github.com/jxom)! - Added `deployless` option to `batch.multicall` on `createClient`.

- [#3883](https://github.com/wevm/viem/pull/3883) [`4758e2ca5ba8a91bec4da9fa952d9e9b920c045d`](https://github.com/wevm/viem/commit/4758e2ca5ba8a91bec4da9fa952d9e9b920c045d) Thanks [@jxom](https://github.com/jxom)! - Added `deployless` parameter to `multicall` Action.

### Patch Changes

- [`427ff4c156b8ef6b2bd4b6f833f6b9008f0ac4b8`](https://github.com/wevm/viem/commit/427ff4c156b8ef6b2bd4b6f833f6b9008f0ac4b8) Thanks [@jxom](https://github.com/jxom)! - Updated Ox.

## 2.35.1

### Patch Changes

- [`768cf82c32dc7f5d9601eb5f601efcef857184c2`](https://github.com/wevm/viem/commit/768cf82c32dc7f5d9601eb5f601efcef857184c2) Thanks [@jxom](https://github.com/jxom)! - Added `authorizationList` to `readContract` and `multicall`.

## 2.35.0

### Minor Changes

- [#3848](https://github.com/wevm/viem/pull/3848) [`390fff8db23f388f520356c9d3847a22acf56a72`](https://github.com/wevm/viem/commit/390fff8db23f388f520356c9d3847a22acf56a72) Thanks [@TateB](https://github.com/TateB)! - Added support for chain-specific ENS resolution and ENS UniversalResolver v3.

### Patch Changes

- [#3871](https://github.com/wevm/viem/pull/3871) [`318218989aaafe413f2d659bed619b30dcf672d3`](https://github.com/wevm/viem/commit/318218989aaafe413f2d659bed619b30dcf672d3) Thanks [@bearpong](https://github.com/bearpong)! - Added `blockTime` for Berachain.

- [#3874](https://github.com/wevm/viem/pull/3874) [`59fd7d5f7f02c0d3eb12ac6d497e5edd5ebc8b77`](https://github.com/wevm/viem/commit/59fd7d5f7f02c0d3eb12ac6d497e5edd5ebc8b77) Thanks [@BigtoMantraDev](https://github.com/BigtoMantraDev)! - Add MANTRA DuKong EVM Testnet

- [#3876](https://github.com/wevm/viem/pull/3876) [`77901c8fa3d8868d26e3821ccc1650457b07092c`](https://github.com/wevm/viem/commit/77901c8fa3d8868d26e3821ccc1650457b07092c) Thanks [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)! - Fixed `_unwatch is not a function` error in `waitForTransactionReceipt`.

- [#3870](https://github.com/wevm/viem/pull/3870) [`f9a10532b4cd8fd8f9dc1430a966a9fad87962df`](https://github.com/wevm/viem/commit/f9a10532b4cd8fd8f9dc1430a966a9fad87962df) Thanks [@essserrr](https://github.com/essserrr)! - Added `blockTime` for:
  - `avalanche`
  - `berachain`
  - `bsc`
  - `etherlink`
  - `hemi`
  - `megaethTestnet`
  - `monadTestnet`
  - `sonic`

## 2.34.0

### Minor Changes

- [#3843](https://github.com/wevm/viem/pull/3843) [`15352db6d002742f455946380fd77b16a8c5e3e1`](https://github.com/wevm/viem/commit/15352db6d002742f455946380fd77b16a8c5e3e1) Thanks [@jxom](https://github.com/jxom)! - **Experimental:** Added support for ERC-7811 `getAssets`

### Patch Changes

- [`c88ae75376af7ed7cae920c25116804214a4fea3`](https://github.com/wevm/viem/commit/c88ae75376af7ed7cae920c25116804214a4fea3) Thanks [@jxom](https://github.com/jxom)! - Updated dependencies.

- [#3854](https://github.com/wevm/viem/pull/3854) [`160841ff0d3d0387c3cfe60fc7c2dfef123942d9`](https://github.com/wevm/viem/commit/160841ff0d3d0387c3cfe60fc7c2dfef123942d9) Thanks [@0xdevant](https://github.com/0xdevant)! - Added Hyperliquid EVM Testnet.

- [#3856](https://github.com/wevm/viem/pull/3856) [`97512ca3adda768db41efb3514de8b8476abf2b2`](https://github.com/wevm/viem/commit/97512ca3adda768db41efb3514de8b8476abf2b2) Thanks [@cr-eative-dev](https://github.com/cr-eative-dev)! - Added Agung testnet chain.
  Updated PEAQ chain RPC URLs.

- [#3849](https://github.com/wevm/viem/pull/3849) [`9d41203c46cf989a489ee33b3f8a12128aad4236`](https://github.com/wevm/viem/commit/9d41203c46cf989a489ee33b3f8a12128aad4236) Thanks [@Yutaro-Mori-eng](https://github.com/Yutaro-Mori-eng)! - Added Humanity Mainnet.

- [#3867](https://github.com/wevm/viem/pull/3867) [`122b28dc11f6d4feccb0d78820cab72e63b33004`](https://github.com/wevm/viem/commit/122b28dc11f6d4feccb0d78820cab72e63b33004) Thanks [@johanneskares](https://github.com/johanneskares)! - Added support for magic.link in `sendCalls` fallback.

- [`29b6853c58a96088c94793da23d2fab5354ce296`](https://github.com/wevm/viem/commit/29b6853c58a96088c94793da23d2fab5354ce296) Thanks [@jxom](https://github.com/jxom)! - Added `blockTime` to `mainnet`.

- [#3868](https://github.com/wevm/viem/pull/3868) [`5e6d33efc9ac25dc2520bbec8e94632cffbe26d0`](https://github.com/wevm/viem/commit/5e6d33efc9ac25dc2520bbec8e94632cffbe26d0) Thanks [@Yutaro-Mori-eng](https://github.com/Yutaro-Mori-eng)! - Added Sova Sepolia.

- [`29b6853c58a96088c94793da23d2fab5354ce296`](https://github.com/wevm/viem/commit/29b6853c58a96088c94793da23d2fab5354ce296) Thanks [@jxom](https://github.com/jxom)! - Updated Story block explorer URLs.

- [#3838](https://github.com/wevm/viem/pull/3838) [`4a5249a83bf35b1bd1b66f202f3f9a665f14674b`](https://github.com/wevm/viem/commit/4a5249a83bf35b1bd1b66f202f3f9a665f14674b) Thanks [@0xheartcode](https://github.com/0xheartcode)! - Removed deprecated astarzkevm and astarzkyoto chains.

- [#3857](https://github.com/wevm/viem/pull/3857) [`7827c35eefd09d1b01256e80e03cbf69af1a67d1`](https://github.com/wevm/viem/commit/7827c35eefd09d1b01256e80e03cbf69af1a67d1) Thanks [@SilverPokerKing](https://github.com/SilverPokerKing)! - Added Katana network.

## 2.33.3

### Patch Changes

- [#3837](https://github.com/wevm/viem/pull/3837) [`5607f0b404aee89a2cc559641339e5f132206e92`](https://github.com/wevm/viem/commit/5607f0b404aee89a2cc559641339e5f132206e92) Thanks [@Yutaro-Mori-eng](https://github.com/Yutaro-Mori-eng)! - Added humanity testnet.

- [`c2acc0df1aceeb81753d7c0d8c525c1480638497`](https://github.com/wevm/viem/commit/c2acc0df1aceeb81753d7c0d8c525c1480638497) Thanks [@jxom](https://github.com/jxom)! - Fixed deserializing of zeroish \`chainId\` and \`nonce\` in EIP-7702 transactions.

- [#3832](https://github.com/wevm/viem/pull/3832) [`ae95de7b38d78059e9feeab95c33655128906791`](https://github.com/wevm/viem/commit/ae95de7b38d78059e9feeab95c33655128906791) Thanks [@bheema-bhx](https://github.com/bheema-bhx)! - Added Autheo Testnet chain.

## 2.33.2

### Patch Changes

- [#3821](https://github.com/wevm/viem/pull/3821) [`97d1eaa8326676652baa41bf534d3e3061f4acf9`](https://github.com/wevm/viem/commit/97d1eaa8326676652baa41bf534d3e3061f4acf9) Thanks [@aaronmgdr](https://github.com/aaronmgdr)! - Added Celo Sepolia chain.

- [#3817](https://github.com/wevm/viem/pull/3817) [`2fa22da5fc5f961f94cdd971e62116c468f98fc9`](https://github.com/wevm/viem/commit/2fa22da5fc5f961f94cdd971e62116c468f98fc9) Thanks [@coffeexcoin](https://github.com/coffeexcoin)! - **ZKsync**: Added `getGasPerPubdata` Action.

- [`58cc43ca6590468bc6ae8f99df8790fb1650fad2`](https://github.com/wevm/viem/commit/58cc43ca6590468bc6ae8f99df8790fb1650fad2) Thanks [@jxom](https://github.com/jxom)! - Added \`throwOnFailure\` to \`waitForCallsStatus\`.

- [#3806](https://github.com/wevm/viem/pull/3806) [`d3ef08ec85ff17db53144b4bb9a7bab6a9e71558`](https://github.com/wevm/viem/commit/d3ef08ec85ff17db53144b4bb9a7bab6a9e71558) Thanks [@jeanregisser](https://github.com/jeanregisser)! - **Account Abstraction**: Added `toUserOperation` utility to convert `PackedUserOperation` to `UserOperation`.

## 2.33.1

### Patch Changes

- [#3814](https://github.com/wevm/viem/pull/3814) [`4751e43e9c7b88de415f89a9d606d972104386b9`](https://github.com/wevm/viem/commit/4751e43e9c7b88de415f89a9d606d972104386b9) Thanks [@b-tarczynski](https://github.com/b-tarczynski)! - Add `blockTime` to Arbitrum chains.

- [#3811](https://github.com/wevm/viem/pull/3811) [`95f2d44d0eca10714f96f965ba4001981be80696`](https://github.com/wevm/viem/commit/95f2d44d0eca10714f96f965ba4001981be80696) Thanks [@Yutaro-Mori-eng](https://github.com/Yutaro-Mori-eng)! - Added reddio mainnet.

- [#3813](https://github.com/wevm/viem/pull/3813) [`9a0ffe6e40e4d93d10721d8e90df27c989554461`](https://github.com/wevm/viem/commit/9a0ffe6e40e4d93d10721d8e90df27c989554461) Thanks [@emrahsky](https://github.com/emrahsky)! - Added Areum chain.

- [#3824](https://github.com/wevm/viem/pull/3824) [`86933772868c24bd491807869b4d51c205be6236`](https://github.com/wevm/viem/commit/86933772868c24bd491807869b4d51c205be6236) Thanks [@smartcontracts](https://github.com/smartcontracts)! - **OP Stack:** Fixed `getWithdrawalStatus` for Upgrade 16.

## 2.33.0

### Minor Changes

- [#3810](https://github.com/wevm/viem/pull/3810) [`d02d1faaeb8d59edff0c2bdd714a08a9428c5419`](https://github.com/wevm/viem/commit/d02d1faaeb8d59edff0c2bdd714a08a9428c5419) Thanks [@jxom](https://github.com/jxom)! - **Experimental:** Added `experimental_blockTag` config option to the Client.

  This will be used as the default block tag for the following actions:
  - `call`
  - `estimateGas`
  - `getBalance`
  - `getBlock`
  - `simulateBlocks`
  - `waitForTransactionReceipt`
  - `watchBlocks`

- [#3810](https://github.com/wevm/viem/pull/3810) [`d02d1faaeb8d59edff0c2bdd714a08a9428c5419`](https://github.com/wevm/viem/commit/d02d1faaeb8d59edff0c2bdd714a08a9428c5419) Thanks [@jxom](https://github.com/jxom)! - **Experimental:** Added an `experimental_preconfirmationTime` property to the Chain configuration for chains that support pre-confirmations (e.g. "Flashblocks").

- [#3808](https://github.com/wevm/viem/pull/3808) [`3fd9761a793c5e3b206b2381c8e145e914cd60e4`](https://github.com/wevm/viem/commit/3fd9761a793c5e3b206b2381c8e145e914cd60e4) Thanks [@jxom](https://github.com/jxom)! - Added `checkReplacement` parameter to `waitForTransactionReceipt`.

### Patch Changes

- [`66d59c4f9e9a5daede9bc19556cfefa879dcfd62`](https://github.com/wevm/viem/commit/66d59c4f9e9a5daede9bc19556cfefa879dcfd62) Thanks [@jxom](https://github.com/jxom)! - Added `basePreconf` and `baseSepoliaPreconf` chains.

## 2.32.1

### Patch Changes

- [#3805](https://github.com/wevm/viem/pull/3805) [`76140d53636ed40bbb0a91ea8054848e34f71193`](https://github.com/wevm/viem/commit/76140d53636ed40bbb0a91ea8054848e34f71193) Thanks [@alvrs](https://github.com/alvrs)! - Fixed reconnection logic for WebSocket clients.

## 2.32.0

### Minor Changes

- [#3799](https://github.com/wevm/viem/pull/3799) [`32f388b97126f3a30aa2f5c1ec04eae1fb52d23d`](https://github.com/wevm/viem/commit/32f388b97126f3a30aa2f5c1ec04eae1fb52d23d) Thanks [@jxom](https://github.com/jxom)! - **Types (Breaking):** Added `version` property to `toCoinbaseSmartAccount`, and add `version: '1.1'`.

  To migrate to this new type change in a current implementation, add `version: '1'` as a property to `toCoinbaseSmartAccount`.

### Patch Changes

- [#3792](https://github.com/wevm/viem/pull/3792) [`6051ca36a7beb979e962366c2409307772542ce4`](https://github.com/wevm/viem/commit/6051ca36a7beb979e962366c2409307772542ce4) Thanks [@rizwanmoulvi](https://github.com/rizwanmoulvi)! - Added Xphere chain.

- [#3802](https://github.com/wevm/viem/pull/3802) [`6467a91ae2e794a1a6661ae288a82458a2ed651a`](https://github.com/wevm/viem/commit/6467a91ae2e794a1a6661ae288a82458a2ed651a) Thanks [@hinsxdcro](https://github.com/hinsxdcro)! - Updated block explorer url of Cronos Testnet

- [#3796](https://github.com/wevm/viem/pull/3796) [`23403edbc3b47998e912c494b6024f7e2b300d0b`](https://github.com/wevm/viem/commit/23403edbc3b47998e912c494b6024f7e2b300d0b) Thanks [@cuonghx-dev](https://github.com/cuonghx-dev)! - Added Japan Open Chain.

- [#3797](https://github.com/wevm/viem/pull/3797) [`e254f78b48eabbf9c134e0ffeed6fc264b100cae`](https://github.com/wevm/viem/commit/e254f78b48eabbf9c134e0ffeed6fc264b100cae) Thanks [@Yutaro-Mori-eng](https://github.com/Yutaro-Mori-eng)! - Added Plasma Testnet.

- [#3785](https://github.com/wevm/viem/pull/3785) [`1862bfc09cf10a4d3cde7218876058123030843a`](https://github.com/wevm/viem/commit/1862bfc09cf10a4d3cde7218876058123030843a) Thanks [@arongrp](https://github.com/arongrp)! - Added Graphite chains

## 2.31.7

### Patch Changes

- [#3772](https://github.com/wevm/viem/pull/3772) [`d79fb7ea8274e98911aa4a42190b8810816585cc`](https://github.com/wevm/viem/commit/d79fb7ea8274e98911aa4a42190b8810816585cc) Thanks [@hazelnutcloud](https://github.com/hazelnutcloud)! - Fixed issue where WebSocket subscriptions did not replay on reconnect.

## 2.31.6

### Patch Changes

- [`ceb4dbbd4c8cd858b2d803bcaad1bfe470cbffae`](https://github.com/wevm/viem/commit/ceb4dbbd4c8cd858b2d803bcaad1bfe470cbffae) Thanks [@jxom](https://github.com/jxom)! - Fixed narrowing of event args type.

## 2.31.5

### Patch Changes

- [#3762](https://github.com/wevm/viem/pull/3762) [`08061b6f9c1b74e018e7d7288d4dccd6781fd7ae`](https://github.com/wevm/viem/commit/08061b6f9c1b74e018e7d7288d4dccd6781fd7ae) Thanks [@adraffy](https://github.com/adraffy)! - Added support for recursion in ENS local batch gateway.

## 2.31.4

### Patch Changes

- [#3744](https://github.com/wevm/viem/pull/3744) [`4842ee5b46f2b1d7f130a879b7267883365f2d26`](https://github.com/wevm/viem/commit/4842ee5b46f2b1d7f130a879b7267883365f2d26) Thanks [@PaulRBerg](https://github.com/PaulRBerg)! - Added multicall3 to Chiliz and Morph.

- [#3751](https://github.com/wevm/viem/pull/3751) [`ca1e87c70af644dc6b9d5bd498fbc1e171891ca1`](https://github.com/wevm/viem/commit/ca1e87c70af644dc6b9d5bd498fbc1e171891ca1) Thanks [@Iretse](https://github.com/Iretse)! - Fixed inferrence on `Calls` type.

- [#3748](https://github.com/wevm/viem/pull/3748) [`e5d6a4b2a5b328830a2e26352f5be888b2e6a511`](https://github.com/wevm/viem/commit/e5d6a4b2a5b328830a2e26352f5be888b2e6a511) Thanks [@croll83](https://github.com/croll83)! - Added TAC and TAC SPB Testnet chains.

- [#3745](https://github.com/wevm/viem/pull/3745) [`08566af344c7c5cb3d79c959943ad6aefc89f092`](https://github.com/wevm/viem/commit/08566af344c7c5cb3d79c959943ad6aefc89f092) Thanks [@emmaodia](https://github.com/emmaodia)! - Updated somniaTestnet Multicall3

- [#3750](https://github.com/wevm/viem/pull/3750) [`681208ac89660e730a0f657a265103426f426494`](https://github.com/wevm/viem/commit/681208ac89660e730a0f657a265103426f426494) Thanks [@Iretse](https://github.com/Iretse)! - Made `ipc` reach parity with `webSocket` for action options.

- [#3755](https://github.com/wevm/viem/pull/3755) [`a19f1dd7be9aa73006b03b550ea53c1cfb167600`](https://github.com/wevm/viem/commit/a19f1dd7be9aa73006b03b550ea53c1cfb167600) Thanks [@mmv08](https://github.com/mmv08)! - Corrected `eth_createAccessList` JSDoc in EIP-1193 types.

## 2.31.3

### Patch Changes

- [#3736](https://github.com/wevm/viem/pull/3736) [`a4159d7c9ebda462ee88ce9f0ca3a23c5c820057`](https://github.com/wevm/viem/commit/a4159d7c9ebda462ee88ce9f0ca3a23c5c820057) Thanks [@jxom](https://github.com/jxom)! - Updated Celo blocktime from 2 seconds to 1 second to reflect the actual network block time.

- [#3741](https://github.com/wevm/viem/pull/3741) [`2d7e8fd3b3d6971f0bc3e01df3ab4068490dba1c`](https://github.com/wevm/viem/commit/2d7e8fd3b3d6971f0bc3e01df3ab4068490dba1c) Thanks [@azf20](https://github.com/azf20)! - Added dataSuffix to `sendCalls` and `simulateBlocks`.

## 2.31.2

### Patch Changes

- [`72cb74da6b605a525c81d94e8d7983c02853d084`](https://github.com/wevm/viem/commit/72cb74da6b605a525c81d94e8d7983c02853d084) Thanks [@jxom](https://github.com/jxom)! - Added support for empty `to` in `simulateBlocks`.

- [`7ea9e83cbe46dd0a5f0764da043fb4bbbd198f82`](https://github.com/wevm/viem/commit/7ea9e83cbe46dd0a5f0764da043fb4bbbd198f82) Thanks [@jxom](https://github.com/jxom)! - Fixed `simulateCalls` incorrectly setting nonce to 0 when using `account` parameter.

- [`2f66fc1ddb119617ae511cc1cf9e1f637f29f45e`](https://github.com/wevm/viem/commit/2f66fc1ddb119617ae511cc1cf9e1f637f29f45e) Thanks [@jxom](https://github.com/jxom)! - Updated dependencies.

- [`9590a0def13049b7e8467a87b5b34c6f70ced509`](https://github.com/wevm/viem/commit/9590a0def13049b7e8467a87b5b34c6f70ced509) Thanks [@jxom](https://github.com/jxom)! - Fixed watchBlocks block number reference to use data.result.number instead of data.blockNumber.

- [`ac4f03600bc628bf0d8aa4eda75c2918b9f98143`](https://github.com/wevm/viem/commit/ac4f03600bc628bf0d8aa4eda75c2918b9f98143) Thanks [@jxom](https://github.com/jxom)! - Fixed async cleanup handling in `observe` to prevent unhandled promise rejections.

## 2.31.1

### Patch Changes

- [#3716](https://github.com/wevm/viem/pull/3716) [`4f5d06623a158244bacdc9a0fcf35b504e32d90d`](https://github.com/wevm/viem/commit/4f5d06623a158244bacdc9a0fcf35b504e32d90d) Thanks [@mikeki](https://github.com/mikeki)! - Updated BSC Testnet name.

- [#3717](https://github.com/wevm/viem/pull/3717) [`25fcce76c41840390395b1fd86470d938507883a`](https://github.com/wevm/viem/commit/25fcce76c41840390395b1fd86470d938507883a) Thanks [@azf20](https://github.com/azf20)! - Added additional known failure cases for the sendCalls experimental fallback

- [#3722](https://github.com/wevm/viem/pull/3722) [`851890821e3a7ef858d99dac05bb6fb448e31e3d`](https://github.com/wevm/viem/commit/851890821e3a7ef858d99dac05bb6fb448e31e3d) Thanks [@cc7768](https://github.com/cc7768)! - Added Blast OP Stack addresses.

## 2.31.0

### Minor Changes

- [#3702](https://github.com/wevm/viem/pull/3702) [`b55ec5a6ee448367d3da844303a6f1a5bc71514a`](https://github.com/wevm/viem/commit/b55ec5a6ee448367d3da844303a6f1a5bc71514a) Thanks [@jxom](https://github.com/jxom)! - Added `blockTime` to OP Stack (2s) & ZKsync (1s) chains.

- [#3702](https://github.com/wevm/viem/pull/3702) [`b55ec5a6ee448367d3da844303a6f1a5bc71514a`](https://github.com/wevm/viem/commit/b55ec5a6ee448367d3da844303a6f1a5bc71514a) Thanks [@jxom](https://github.com/jxom)! - Added `blockTime` to the `Chain` type. Polling intervals are now influenced from this property (if set).

### Patch Changes

- [`4b8bcc21b919addb1defe4872f7505d7d5bbc645`](https://github.com/wevm/viem/commit/4b8bcc21b919addb1defe4872f7505d7d5bbc645) Thanks [@jxom](https://github.com/jxom)! - Loosened account requirement on `sendCalls`.

- [#3695](https://github.com/wevm/viem/pull/3695) [`20b1ed2a08a4728e6b6e20b4e3ce1f2124fef20d`](https://github.com/wevm/viem/commit/20b1ed2a08a4728e6b6e20b4e3ce1f2124fef20d) Thanks [@ersanyakit](https://github.com/ersanyakit)! - Added multicall3 to Chiliz chain.

- [#3707](https://github.com/wevm/viem/pull/3707) [`32f30335c785d4a0a790e477ef9b732a3f09dd57`](https://github.com/wevm/viem/commit/32f30335c785d4a0a790e477ef9b732a3f09dd57) Thanks [@jribbink](https://github.com/jribbink)! - Added `blockTime` to Flow chains.

- [`530928066db83540e57f8751308ebb2e557a3644`](https://github.com/wevm/viem/commit/530928066db83540e57f8751308ebb2e557a3644) Thanks [@jxom](https://github.com/jxom)! - Fixed issue where `decodeEventLog` would not check validity of the topic against the signature.

## 2.30.6

### Patch Changes

- [#3687](https://github.com/wevm/viem/pull/3687) [`96a638da2a9a2e56d0a40238a229d5b2a9d30e9f`](https://github.com/wevm/viem/commit/96a638da2a9a2e56d0a40238a229d5b2a9d30e9f) Thanks [@jgannonjr](https://github.com/jgannonjr)! - Updated `WebSocketTransportSubscribe` type.

- [#3681](https://github.com/wevm/viem/pull/3681) [`628e05f8abeee4ecd2280e18d409acc2d29201db`](https://github.com/wevm/viem/commit/628e05f8abeee4ecd2280e18d409acc2d29201db) Thanks [@ga-reth](https://github.com/ga-reth)! - Added Omni chains.

- [`f16aa05dce498bb08afa24a8bcfbf49131e0647b`](https://github.com/wevm/viem/commit/f16aa05dce498bb08afa24a8bcfbf49131e0647b) Thanks [@jxom](https://github.com/jxom)! - Reverted [530f0f1](https://github.com/wevm/viem/commit/530f0f1693983c7de1676873f9f234033e5267e1).

- [#3688](https://github.com/wevm/viem/pull/3688) [`d88a55b8f41c928767f1cbc2fa82d04e4ca9e3a3`](https://github.com/wevm/viem/commit/d88a55b8f41c928767f1cbc2fa82d04e4ca9e3a3) Thanks [@jgalat](https://github.com/jgalat)! - Fixed ordering of decoded arguments in `decodeEventLog`.

## 2.30.5

### Patch Changes

- [#3682](https://github.com/wevm/viem/pull/3682) [`f618732c28e68883513f5326b824b938b93c6ea5`](https://github.com/wevm/viem/commit/f618732c28e68883513f5326b824b938b93c6ea5) Thanks [@jxom](https://github.com/jxom)! - Propagated `authorizationList` property on `call` Action.

## 2.30.4

### Patch Changes

- [`d4f68e5aaafd901cd9ae6b92eb9b398e7b3a92bd`](https://github.com/wevm/viem/commit/d4f68e5aaafd901cd9ae6b92eb9b398e7b3a92bd) Thanks [@jxom](https://github.com/jxom)! - **ZKSync:** Fixed zero hash import.

## 2.30.3

### Patch Changes

- [`7fe8f4b72b7055d012e27f0d8dcc98340ace282c`](https://github.com/wevm/viem/commit/7fe8f4b72b7055d012e27f0d8dcc98340ace282c) Thanks [@jxom](https://github.com/jxom)! - **ZKSync:** Fixed zero hash import.

## 2.30.2

### Patch Changes

- [#3555](https://github.com/wevm/viem/pull/3555) [`5f5b984682814c7beb4a93579c648e7d1b252ef0`](https://github.com/wevm/viem/commit/5f5b984682814c7beb4a93579c648e7d1b252ef0) Thanks [@danijelTxFusion](https://github.com/danijelTxFusion)! - Added support for ZKsync v26, removed support for v25.

- [#3676](https://github.com/wevm/viem/pull/3676) [`930be3d5381f738528cc5b1258319bef1bffdc62`](https://github.com/wevm/viem/commit/930be3d5381f738528cc5b1258319bef1bffdc62) Thanks [@awesamarth](https://github.com/awesamarth)! - Added RISE Testnet

- [#3672](https://github.com/wevm/viem/pull/3672) [`549dc06baed10f165f6dc9d97d221d310fb6ebe0`](https://github.com/wevm/viem/commit/549dc06baed10f165f6dc9d97d221d310fb6ebe0) Thanks [@gil7788](https://github.com/gil7788)! - Deprecated Zircuit Testnet.

- [`2e1c02d1f90ef8a8e097c4f0191b10d4268b82d5`](https://github.com/wevm/viem/commit/2e1c02d1f90ef8a8e097c4f0191b10d4268b82d5) Thanks [@jxom](https://github.com/jxom)! - Handled connection errors for Actions that use WebSockets.

- [#3675](https://github.com/wevm/viem/pull/3675) [`77b2704ec90de2a50c3f7991351a1924a5a873d7`](https://github.com/wevm/viem/commit/77b2704ec90de2a50c3f7991351a1924a5a873d7) Thanks [@coshi190](https://github.com/coshi190)! - Updated KUB Chain and JB Chain

- [`2e1c02d1f90ef8a8e097c4f0191b10d4268b82d5`](https://github.com/wevm/viem/commit/2e1c02d1f90ef8a8e097c4f0191b10d4268b82d5) Thanks [@jxom](https://github.com/jxom)! - Default to `pending` block tag for `call`, `estimateGas`, `simulateBlocks`, and dependent Actions.

## 2.30.1

### Patch Changes

- [#3660](https://github.com/wevm/viem/pull/3660) [`1bde5ecadbd9f97220a51fee519dbb09f1a940ea`](https://github.com/wevm/viem/commit/1bde5ecadbd9f97220a51fee519dbb09f1a940ea) Thanks [@ersanyakit](https://github.com/ersanyakit)! - Updated chiliz RPC URLs.

- [`71c424e217ffeca4b2d055619916eaf880deb868`](https://github.com/wevm/viem/commit/71c424e217ffeca4b2d055619916eaf880deb868) Thanks [@jxom](https://github.com/jxom)! - Updated dependencies.

- [#3671](https://github.com/wevm/viem/pull/3671) [`9ed3cef1c4aea557098bbab8e33ea4f3c1eeddf9`](https://github.com/wevm/viem/commit/9ed3cef1c4aea557098bbab8e33ea4f3c1eeddf9) Thanks [@frankudoags](https://github.com/frankudoags)! - Fixed `waitForTransactionReceipt` leak on timeout.

## 2.30.0

### Minor Changes

- [#3657](https://github.com/wevm/viem/pull/3657) [`b9a1ac1673df3e17aba8e1157ac3da32be56018e`](https://github.com/wevm/viem/commit/b9a1ac1673df3e17aba8e1157ac3da32be56018e) Thanks [@jxom](https://github.com/jxom)! - Added `experimental_fallback` property to `sendCalls` for wallets that do not support EIP-5792 (falls back to `eth_sendTransaction`).

### Patch Changes

- [`e20bf3a11782a829b8e1da5051e040624f5d3755`](https://github.com/wevm/viem/commit/e20bf3a11782a829b8e1da5051e040624f5d3755) Thanks [@jxom](https://github.com/jxom)! - Fixed non-portable types.

- [#3658](https://github.com/wevm/viem/pull/3658) [`5d9bdabd61a95a22a914c78c242fa9cfbc803ed1`](https://github.com/wevm/viem/commit/5d9bdabd61a95a22a914c78c242fa9cfbc803ed1) Thanks [@ly0va](https://github.com/ly0va)! - **ZKsync Extension:** Fixed default data value.

## 2.29.4

### Patch Changes

- [`61d8df4c205bef20e6d141d2f809665128737a5d`](https://github.com/wevm/viem/commit/61d8df4c205bef20e6d141d2f809665128737a5d) Thanks [@jxom](https://github.com/jxom)! - Fixed parsing of zeroish nonces on `parseTransaction`.

- [#3654](https://github.com/wevm/viem/pull/3654) [`256a81b4e154c7f03ad4d5b2b8dcfa6f61c32f08`](https://github.com/wevm/viem/commit/256a81b4e154c7f03ad4d5b2b8dcfa6f61c32f08) Thanks [@lucasloisp](https://github.com/lucasloisp)! - Updated dependencies.

## 2.29.3

### Patch Changes

- [#3639](https://github.com/wevm/viem/pull/3639) [`54d5114f7fbdfa4e866f16d8f1fa5ee851bc9979`](https://github.com/wevm/viem/commit/54d5114f7fbdfa4e866f16d8f1fa5ee851bc9979) Thanks [@izayl](https://github.com/izayl)! - Added `account` parameter to multicall.

- [`ba718e23e3e19a064abc35e31234b7759b0d1b6e`](https://github.com/wevm/viem/commit/ba718e23e3e19a064abc35e31234b7759b0d1b6e) Thanks [@jxom](https://github.com/jxom)! - Fixed ERC-7677 `paymasterService` capability types.

## 2.29.2

### Patch Changes

- [#3635](https://github.com/wevm/viem/pull/3635) [`1fab6bb67fef1d274fa947ea9b088cf1285ccd1e`](https://github.com/wevm/viem/commit/1fab6bb67fef1d274fa947ea9b088cf1285ccd1e) Thanks [@joroshiba](https://github.com/joroshiba)! - Added Flame mainnet chain.

- [`786d95e067918520dbf183e32f6ff391bac4afe2`](https://github.com/wevm/viem/commit/786d95e067918520dbf183e32f6ff391bac4afe2) Thanks [@jxom](https://github.com/jxom)! - **Experimental:** Updated EIP-7895 to latest spec.

- [#3637](https://github.com/wevm/viem/pull/3637) [`636c7bde0bea5877202107affe539a7a4577fc0c`](https://github.com/wevm/viem/commit/636c7bde0bea5877202107affe539a7a4577fc0c) Thanks [@deodad](https://github.com/deodad)! - Hardened address validation in `validateSiweMessage`.

## 2.29.1

### Patch Changes

- [#3631](https://github.com/wevm/viem/pull/3631) [`1a49c75e44552c3bbb37f165adbb512fff0ed81b`](https://github.com/wevm/viem/commit/1a49c75e44552c3bbb37f165adbb512fff0ed81b) Thanks [@cruzdanilo](https://github.com/cruzdanilo)! - Added support for `blockOverrides` on `call`.

- [#3625](https://github.com/wevm/viem/pull/3625) [`c8b6a18a229c8fc7137dfee67cd805c0d6c4f01f`](https://github.com/wevm/viem/commit/c8b6a18a229c8fc7137dfee67cd805c0d6c4f01f) Thanks [@alien-max](https://github.com/alien-max)! - Added arenaz chain.

- [#3632](https://github.com/wevm/viem/pull/3632) [`31cdcda9383cb880bbe2e63852c5c881f12d1a02`](https://github.com/wevm/viem/commit/31cdcda9383cb880bbe2e63852c5c881f12d1a02) Thanks [@zainbacchus](https://github.com/zainbacchus)! - Updated `disputeGameFactory` contract for World Sepolia.

- [`f3ec11e0688e57953b48628dde34a23ad9b4a01b`](https://github.com/wevm/viem/commit/f3ec11e0688e57953b48628dde34a23ad9b4a01b) Thanks [@jxom](https://github.com/jxom)! - Added `./experimental/erc7895` to `package.json#exports`.

- [#3623](https://github.com/wevm/viem/pull/3623) [`5cf857b6d2f1e25b635626c0e3056dc769bbf75d`](https://github.com/wevm/viem/commit/5cf857b6d2f1e25b635626c0e3056dc769bbf75d) Thanks [@aaronmgdr](https://github.com/aaronmgdr)! - **Celo:** Updated `CeloBlock` & `CeloRpcBlock` types.

## 2.29.0

### Minor Changes

- [#3621](https://github.com/wevm/viem/pull/3621) [`cede184b5ed9519ce8538bd9e99db4961d531798`](https://github.com/wevm/viem/commit/cede184b5ed9519ce8538bd9e99db4961d531798) Thanks [@jxom](https://github.com/jxom)! - **Experimental:** Added `addSubAccount` Action as per [ERC-7895](https://github.com/ethereum/ERCs/blob/4d3d641ee3c84750baf461b8dd71d27c424417a9/ERCS/erc-7895.md).

- [#3619](https://github.com/wevm/viem/pull/3619) [`4563ed5147f13c679043fae30d955b7a72cfc60f`](https://github.com/wevm/viem/commit/4563ed5147f13c679043fae30d955b7a72cfc60f) Thanks [@jxom](https://github.com/jxom)! - **Experimental:** Added capabilities for the `connect` Action:
  - `unstable_addSubAccount`: Adds a sub-account to the connected account. [See more](https://github.com/ethereum/ERCs/blob/4d3d641ee3c84750baf461b8dd71d27c424417a9/ERCS/erc-7895.md).
  - `unstable_getSubAccounts`: Returns all sub-accounts of the connected account. [See more](https://github.com/ethereum/ERCs/blob/4d3d641ee3c84750baf461b8dd71d27c424417a9/ERCS/erc-7895.md).
  - `unstable_signInWithEthereum`: Connect + Authenticate using Sign-In with Ethereum.[See more](https://github.com/ethereum/ERCs/blob/abd1c9f4eda2d6ad06ade0e3af314637a27d1ee7/ERCS/erc-7846.md#signinwithethereum).

- [#3619](https://github.com/wevm/viem/pull/3619) [`4563ed5147f13c679043fae30d955b7a72cfc60f`](https://github.com/wevm/viem/commit/4563ed5147f13c679043fae30d955b7a72cfc60f) Thanks [@jxom](https://github.com/jxom)! - **Experimental:** Added `connect` + `disconnect` Actions as per [ERC-7836: Wallet Connection API (`wallet_connect`)](https://github.com/ethereum/ERCs/pull/779).

### Patch Changes

- [#3626](https://github.com/wevm/viem/pull/3626) [`da3a50f01b8383c2c6023a57806aae0fb6e6e585`](https://github.com/wevm/viem/commit/da3a50f01b8383c2c6023a57806aae0fb6e6e585) Thanks [@fubhy](https://github.com/fubhy)! - Updated `watchBlocks` to also work from genesis blocks using `emitMissed`.

## 2.28.4

### Patch Changes

- [#3615](https://github.com/wevm/viem/pull/3615) [`804187c8c8b48654605f47e4383a57ec66a21064`](https://github.com/wevm/viem/commit/804187c8c8b48654605f47e4383a57ec66a21064) Thanks [@jxom](https://github.com/jxom)! - Added typed EIP-5792 capabilities.

## 2.28.3

### Patch Changes

- [#3611](https://github.com/wevm/viem/pull/3611) [`6cc31bbc87c788b0ccad15ab648e467222ae9105`](https://github.com/wevm/viem/commit/6cc31bbc87c788b0ccad15ab648e467222ae9105) Thanks [@jxom](https://github.com/jxom)! - Passed `chainId` to `wallet_getCapabilities`.

## 2.28.2

### Patch Changes

- [#3600](https://github.com/wevm/viem/pull/3600) [`198504d07507e9ece02f00241a567bec43eae38a`](https://github.com/wevm/viem/commit/198504d07507e9ece02f00241a567bec43eae38a) Thanks [@TateB](https://github.com/TateB)! - Added `type` parameter to `sendTransaction`.

- [#3607](https://github.com/wevm/viem/pull/3607) [`e39d6c1ea4a54866bfeb7eadb445598d20033798`](https://github.com/wevm/viem/commit/e39d6c1ea4a54866bfeb7eadb445598d20033798) Thanks [@Ryan-Adami](https://github.com/Ryan-Adami)! - Updated Fraxtal and Fraxtal testnet native currency to FRAX.

## 2.28.1

### Patch Changes

- [`982e2cadbe8647fbe59108080b5cb13327cbfbaa`](https://github.com/wevm/viem/commit/982e2cadbe8647fbe59108080b5cb13327cbfbaa) Thanks [@jxom](https://github.com/jxom)! - Added assertion for signature length in signature validation.

- [#3596](https://github.com/wevm/viem/pull/3596) [`4b960104bd5bd3b277fc697a11dd0b7ff01be065`](https://github.com/wevm/viem/commit/4b960104bd5bd3b277fc697a11dd0b7ff01be065) Thanks [@tech-memecore](https://github.com/tech-memecore)! - Added MemeCore mainnet and testnet.

- [#3599](https://github.com/wevm/viem/pull/3599) [`4bbab5f3e88268b8a4138460a4701ee3eb07adb8`](https://github.com/wevm/viem/commit/4bbab5f3e88268b8a4138460a4701ee3eb07adb8) Thanks [@Yutaro-Mori-eng](https://github.com/Yutaro-Mori-eng)! - Added Shardeum mainnet.

## 2.28.0

### Minor Changes

- [#3580](https://github.com/wevm/viem/pull/3580) [`6aa70af8324612d8aeb0bb15ebe9d7b6d1688f4a`](https://github.com/wevm/viem/commit/6aa70af8324612d8aeb0bb15ebe9d7b6d1688f4a) Thanks [@jxom](https://github.com/jxom)! - **Account Abstraction:** Added support for EIP-7702 Authorizations on User Operations.

- [#3580](https://github.com/wevm/viem/pull/3580) [`6aa70af8324612d8aeb0bb15ebe9d7b6d1688f4a`](https://github.com/wevm/viem/commit/6aa70af8324612d8aeb0bb15ebe9d7b6d1688f4a) Thanks [@jxom](https://github.com/jxom)! - **Account Abstraction:** Added support for EntryPoint 0.8.

- [#3592](https://github.com/wevm/viem/pull/3592) [`e88edb2087ad31cf80ceb04549c12fb2cb46b62f`](https://github.com/wevm/viem/commit/e88edb2087ad31cf80ceb04549c12fb2cb46b62f) Thanks [@jxom](https://github.com/jxom)! - Stabilized EIP-5792 (moved out of experimental).

### Patch Changes

- [#3531](https://github.com/wevm/viem/pull/3531) [`573e7d70ec3a58c2bd395f47987422a5ab6d0475`](https://github.com/wevm/viem/commit/573e7d70ec3a58c2bd395f47987422a5ab6d0475) Thanks [@RobbyUitbeijerse](https://github.com/RobbyUitbeijerse)! - Added ERC-1155 export.

## 2.27.3

### Patch Changes

- [#3581](https://github.com/wevm/viem/pull/3581) [`bb9398a43ebbb8d9af52832a845c0ebe19495a2e`](https://github.com/wevm/viem/commit/bb9398a43ebbb8d9af52832a845c0ebe19495a2e) Thanks [@Yutaro-Mori-eng](https://github.com/Yutaro-Mori-eng)! - Added Gunz Mainnet.

- [#3588](https://github.com/wevm/viem/pull/3588) [`0098740f4930a80744efc218303fb986f961d4db`](https://github.com/wevm/viem/commit/0098740f4930a80744efc218303fb986f961d4db) Thanks [@talentlessguy](https://github.com/talentlessguy)! - Updated noble dependencies.

## 2.27.2

### Patch Changes

- [#3570](https://github.com/wevm/viem/pull/3570) [`a9f33168c0c11ade302bd66373c57c1e2386e2bd`](https://github.com/wevm/viem/commit/a9f33168c0c11ade302bd66373c57c1e2386e2bd) Thanks [@manuelbarbas](https://github.com/manuelbarbas)! - Updated SKALE Network Chains.

- [#3579](https://github.com/wevm/viem/pull/3579) [`295e4f9e1a8aab79f88f8e59c4d5e7ac25def1ae`](https://github.com/wevm/viem/commit/295e4f9e1a8aab79f88f8e59c4d5e7ac25def1ae) Thanks [@jxom](https://github.com/jxom)! - **Account Abstraction:** Made `toCoinbaseSmartWallet` prefer `signTypedData` on owners.

- [#3571](https://github.com/wevm/viem/pull/3571) [`b43af337761520f9c4d616d05387e5aae9473348`](https://github.com/wevm/viem/commit/b43af337761520f9c4d616d05387e5aae9473348) Thanks [@gr-akshaya](https://github.com/gr-akshaya)! - Added Core Blockchain Testnet details

- [#3568](https://github.com/wevm/viem/pull/3568) [`2ad4736e25ddfe8f4ad3f4d031440f6e72f912e2`](https://github.com/wevm/viem/commit/2ad4736e25ddfe8f4ad3f4d031440f6e72f912e2) Thanks [@Markeljan](https://github.com/Markeljan)! - Fixed Metis & Metis Sepolia rpcUrls config

- [#3567](https://github.com/wevm/viem/pull/3567) [`f28503e0f96f14bc0c75b56d92bf08a00c70f490`](https://github.com/wevm/viem/commit/f28503e0f96f14bc0c75b56d92bf08a00c70f490) Thanks [@Markeljan](https://github.com/Markeljan)! - Fixed Newton chain rpc url typo

## 2.27.0

### Minor Changes

- [#3440](https://github.com/wevm/viem/pull/3440) [`e06a46a732d075f3a0d3bca916f82f39ee9d4344`](https://github.com/wevm/viem/commit/e06a46a732d075f3a0d3bca916f82f39ee9d4344) Thanks [@adraffy](https://github.com/adraffy)! - Added support for [ENSIP-21: Batch Gateway Offchain Lookup Protocol](https://github.com/ensdomains/ensips/blob/master/ensips/21.md).

### Patch Changes

- [#3564](https://github.com/wevm/viem/pull/3564) [`f22fe5ac63a4e403949fe301f548f28ac0c1a070`](https://github.com/wevm/viem/commit/f22fe5ac63a4e403949fe301f548f28ac0c1a070) Thanks [@abs3ntdev](https://github.com/abs3ntdev)! - Added Tron Shasta network

- [#3561](https://github.com/wevm/viem/pull/3561) [`8053048eaac6d3ad8e800742681ac27cbd8ed18a`](https://github.com/wevm/viem/commit/8053048eaac6d3ad8e800742681ac27cbd8ed18a) Thanks [@menefrego15](https://github.com/menefrego15)! - Added multicall3 contract to Hoodi chain

- [`151e8944cd2eb2eb742dc84e566e886d0d638d3b`](https://github.com/wevm/viem/commit/151e8944cd2eb2eb742dc84e566e886d0d638d3b) Thanks [@jxom](https://github.com/jxom)! - Fixed ERC-7739 `signMessage` domain to not include salt.

- [#3565](https://github.com/wevm/viem/pull/3565) [`542371cce67fa2bb2730e24a267629f4a2e89520`](https://github.com/wevm/viem/commit/542371cce67fa2bb2730e24a267629f4a2e89520) Thanks [@foxtrotravi](https://github.com/foxtrotravi)! - Added Lestnet chain.

- [`4ba1a41f6b309d4d77236b073eb5b9da0f6330f5`](https://github.com/wevm/viem/commit/4ba1a41f6b309d4d77236b073eb5b9da0f6330f5) Thanks [@jxom](https://github.com/jxom)! - Fixed `getCallsStatus` failure status codes.

## 2.26.5

### Patch Changes

- [#3558](https://github.com/wevm/viem/pull/3558) [`ba55147b8b42552d29c25be6368c6e4bb50bb25c`](https://github.com/wevm/viem/commit/ba55147b8b42552d29c25be6368c6e4bb50bb25c) Thanks [@jxom](https://github.com/jxom)! - Added EIP-5792 errors.

## 2.26.4

### Patch Changes

- [#3553](https://github.com/wevm/viem/pull/3553) [`7487580941c1527483dca5267bd6817913d01aeb`](https://github.com/wevm/viem/commit/7487580941c1527483dca5267bd6817913d01aeb) Thanks [@Yutaro-Mori-eng](https://github.com/Yutaro-Mori-eng)! - Added Lens mainnet.

## 2.26.3

### Patch Changes

- [`973d88ea66192c8a73410ca2dea2034e6a2c96a1`](https://github.com/wevm/viem/commit/973d88ea66192c8a73410ca2dea2034e6a2c96a1) Thanks [@jxom](https://github.com/jxom)! - **Experimental (EIP-5792):** Fixed `getCallsStatus` return value

## 2.26.2

### Patch Changes

- [`f736d9b2a6711a739a1fbae8c3c18fb694b407a4`](https://github.com/wevm/viem/commit/f736d9b2a6711a739a1fbae8c3c18fb694b407a4) Thanks [@jxom](https://github.com/jxom)! - Exported `withCache`.

## 2.26.1

### Patch Changes

- [#3545](https://github.com/wevm/viem/pull/3545) [`33a01b96554759bb9fa60d3c4bfc1c2cd5974ddc`](https://github.com/wevm/viem/commit/33a01b96554759bb9fa60d3c4bfc1c2cd5974ddc) Thanks [@bmzig](https://github.com/bmzig)! - **OP Stack:** Fixed `Unproven` case.

## 2.26.0

### Minor Changes

- [#3542](https://github.com/wevm/viem/pull/3542) [`082c3d0fcc2e376954116d380c65c6ac95293681`](https://github.com/wevm/viem/commit/082c3d0fcc2e376954116d380c65c6ac95293681) Thanks [@jxom](https://github.com/jxom)! - **Breaking (Experimental):** Updated EIP-5792 to the latest spec changes. The following APIs have been updated:

  #### `getCallsStatus`

  ```diff
  const result = await client.getCallsStatus({ id })
  //    ^?
        {
  +       atomic: boolean
  +       chainId: number
  +       id: string
          receipts: Receipt[]
  -       status: 'PENDING' | 'CONFIRMED'
  +       status: 'pending' | 'success' | 'failure' | undefined
  +       statusCode: number
  +       version: string
  }
  ```

  #### `sendCalls`

  ```diff
  const result = await client.sendCalls({ calls })
  //    ^?
  -     string
  +     { id: string, capabilities?: Capabilities }
  ```

  #### `waitForCallsStatus`

  ```diff
  const result = await client.waitForCallsStatus({ id })
  //    ^?
        {
  +       atomic: boolean
  +       chainId: number
  +       id: string
          receipts: Receipt[]
  -       status: 'PENDING' | 'CONFIRMED'
  +       status: 'pending' | 'success' | 'failure' | undefined
  +       statusCode: number
  +       version: string
  }
  ```

### Patch Changes

- [#3542](https://github.com/wevm/viem/pull/3542) [`082c3d0fcc2e376954116d380c65c6ac95293681`](https://github.com/wevm/viem/commit/082c3d0fcc2e376954116d380c65c6ac95293681) Thanks [@jxom](https://github.com/jxom)! - **Experimental:** Added `forceAtomic` and `id` parameters to `sendCalls`

## 2.25.0

### Minor Changes

- [#3540](https://github.com/wevm/viem/pull/3540) [`48cffbc3175f02c0f3835230b8945802e34a1220`](https://github.com/wevm/viem/commit/48cffbc3175f02c0f3835230b8945802e34a1220) Thanks [@jxom](https://github.com/jxom)! - Added `ensTlds` chain config option.

### Patch Changes

- [`58db8b90d72983814664b12bd27bcd2bdf0f15f3`](https://github.com/wevm/viem/commit/58db8b90d72983814664b12bd27bcd2bdf0f15f3) Thanks [@jxom](https://github.com/jxom)! - **OP Stack:** Fixed unhandled `waiting-to-prove` case.

- [#3537](https://github.com/wevm/viem/pull/3537) [`e367fdb4b0e866bd31e8240032632b6512c9a422`](https://github.com/wevm/viem/commit/e367fdb4b0e866bd31e8240032632b6512c9a422) Thanks [@alainncls](https://github.com/alainncls)! - Added ENS contracts to Linea Sepolia and Mainnet.

## 2.24.3

### Patch Changes

- [#3508](https://github.com/wevm/viem/pull/3508) [`cd5fb433a1f90bce39ae5846cb58770066c4ed10`](https://github.com/wevm/viem/commit/cd5fb433a1f90bce39ae5846cb58770066c4ed10) Thanks [@noface-infinex](https://github.com/noface-infinex)! - Added megaeth testnet multicall3 address.

- [#3522](https://github.com/wevm/viem/pull/3522) [`bc2fbdeac97c2958f9b0d21c01167e23604fbfdf`](https://github.com/wevm/viem/commit/bc2fbdeac97c2958f9b0d21c01167e23604fbfdf) Thanks [@petermetz](https://github.com/petermetz)! - Ensured that the `keepAlive` and `reconnect` parameters are passed through to
  the underlying implementation (`getWebSocketRpcClient()`) when the top level
  `webSocket()` transport factory function is called with them specified.

- [#3510](https://github.com/wevm/viem/pull/3510) [`d8f2ab6236346c02da511c7b310cdcc660773576`](https://github.com/wevm/viem/commit/d8f2ab6236346c02da511c7b310cdcc660773576) Thanks [@jeanregisser](https://github.com/jeanregisser)! - **Celo:** Removed check for L2 in fee estimation following the successful hardfork.

- [#3514](https://github.com/wevm/viem/pull/3514) [`3ca83a8cd985eb2bee462e74eb09d0a759b3b0d9`](https://github.com/wevm/viem/commit/3ca83a8cd985eb2bee462e74eb09d0a759b3b0d9) Thanks [@darwintree](https://github.com/darwintree)! - Updated ConfluxScan links

- [#3523](https://github.com/wevm/viem/pull/3523) [`3af11a52f25578fc72248879c3090d38c94fdf8b`](https://github.com/wevm/viem/commit/3af11a52f25578fc72248879c3090d38c94fdf8b) Thanks [@biruichen](https://github.com/biruichen)! - Added Swellchain Testnet.

- [#3529](https://github.com/wevm/viem/pull/3529) [`77a0938552cbcce6ff8aac4ff4ae57c3fa3a45df`](https://github.com/wevm/viem/commit/77a0938552cbcce6ff8aac4ff4ae57c3fa3a45df) Thanks [@abs3ntdev](https://github.com/abs3ntdev)! - Added Westend Asset Hub network

- [#3530](https://github.com/wevm/viem/pull/3530) [`cf58f89206df56aba82a52302a43846ea58fdfae`](https://github.com/wevm/viem/commit/cf58f89206df56aba82a52302a43846ea58fdfae) Thanks [@jxom](https://github.com/jxom)! - Optimized OP Stack gas & fee estimation, and resolved #3513.

## 2.24.2

### Patch Changes

- [#3517](https://github.com/wevm/viem/pull/3517) [`3032dca3e57f5f7c5647ddc9fdbdbc6c7ec8f694`](https://github.com/wevm/viem/commit/3032dca3e57f5f7c5647ddc9fdbdbc6c7ec8f694) Thanks [@jxom](https://github.com/jxom)! - Added missing deprecated `viem/experimental` exports.

## 2.24.1

### Patch Changes

- [`f988a5762f7ffdd0d1c3bab7de1f4e706bab59ae`](https://github.com/wevm/viem/commit/f988a5762f7ffdd0d1c3bab7de1f4e706bab59ae) Thanks [@jxom](https://github.com/jxom)! - Fixed `Authorization` type.

- [`69e116862b8903b920485f685e99c16323130870`](https://github.com/wevm/viem/commit/69e116862b8903b920485f685e99c16323130870) Thanks [@jxom](https://github.com/jxom)! - Fixed `Authorization` type.

## 2.24.0

### Minor Changes

- [#3427](https://github.com/wevm/viem/pull/3427) [`2a5ded4eab7febcf2b77a88cfe3c34a621d4dfe7`](https://github.com/wevm/viem/commit/2a5ded4eab7febcf2b77a88cfe3c34a621d4dfe7) Thanks [@jxom](https://github.com/jxom)! - Stabilized EIP-7702.
  - Added `prepareAuthorization` and `signAuthorization` Actions to the Wallet Client.
  - Added `hashAuthorization`, `recoverAuthorizationAddress`, and `verifyAuthorization` Utilities.
  - Renamed `account.experimental_signAuthorization` to `account.signAuthorization`.

- [#3427](https://github.com/wevm/viem/pull/3427) [`2a5ded4eab7febcf2b77a88cfe3c34a621d4dfe7`](https://github.com/wevm/viem/commit/2a5ded4eab7febcf2b77a88cfe3c34a621d4dfe7) Thanks [@jxom](https://github.com/jxom)! - **BREAKING (Experimental)**: Removed deprecated `walletActionsEip5792` export. Use `eip5792Actions` instead.

- [#3427](https://github.com/wevm/viem/pull/3427) [`2a5ded4eab7febcf2b77a88cfe3c34a621d4dfe7`](https://github.com/wevm/viem/commit/2a5ded4eab7febcf2b77a88cfe3c34a621d4dfe7) Thanks [@jxom](https://github.com/jxom)! - **BREAKING (Experimental)**: Removed deprecated ERC-6492 exports in `viem/experimental`. These are no longer experimental. Use exports from `viem` instead.

- [#3427](https://github.com/wevm/viem/pull/3427) [`2a5ded4eab7febcf2b77a88cfe3c34a621d4dfe7`](https://github.com/wevm/viem/commit/2a5ded4eab7febcf2b77a88cfe3c34a621d4dfe7) Thanks [@jxom](https://github.com/jxom)! - **BREAKING (Experimental)**: Removed deprecated `walletActionsErc7715` export. Use `erc7715Actions` instead.

- [#3427](https://github.com/wevm/viem/pull/3427) [`2a5ded4eab7febcf2b77a88cfe3c34a621d4dfe7`](https://github.com/wevm/viem/commit/2a5ded4eab7febcf2b77a88cfe3c34a621d4dfe7) Thanks [@jxom](https://github.com/jxom)! - **BREAKING (Experimental)**:

  Removed EIP-7702 exports in `viem/experimental`. These are no longer experimental. Use exports from `viem` or `viem/utils` instead.

  Note, there is also a behavioral change in the stable EIP-7702 `signAuthorization` function. Previously, it was assumed that the signer of the Authorization was also the executor of the Transaction. This is no longer the case.

  If the signer of the Authorization is **NOT** the executor of the Transaction, you no longer need to pass a `sponsor` parameter.

  ```diff
  const eoa = privateKeyToAccount('0x...')
  const relay = privateKeyToAccount('0x...')

  const authorization = await client.signAuthorization({
    account: eoa,
    contractAddress: '0x...',
  - sponsor: true
  })

  const transaction = await client.sendTransaction({
    account: relay,
    authorizationList: [authorization],
  })
  ```

  If the signer of the Authorization is **ALSO** the executor of the Transaction, you will now need to pass the `executor` parameter with a value of `'self'`.

  ```diff
  const eoa = privateKeyToAccount('0x...')

  const authorization = await client.signAuthorization({
    account: eoa,
    contractAddress: '0x...',
  + executor: 'self',
  })

  const transaction = await client.sendTransaction({
    account: eoa,
    authorizationList: [authorization],
  })
  ```

### Patch Changes

- [#3469](https://github.com/wevm/viem/pull/3469) [`3f00c5f28e8a4eec0ee60fe3bb9acdc5e828d1c7`](https://github.com/wevm/viem/commit/3f00c5f28e8a4eec0ee60fe3bb9acdc5e828d1c7) Thanks [@danijelTxFusion](https://github.com/danijelTxFusion)! - **ZKSync Extension:** Added `deposit` action.

- [#3497](https://github.com/wevm/viem/pull/3497) [`512ee19fdaf309d2ec607e024ecdb08ffbde5f68`](https://github.com/wevm/viem/commit/512ee19fdaf309d2ec607e024ecdb08ffbde5f68) Thanks [@DiRaiks](https://github.com/DiRaiks)! - Changed Hoodi block explorer to Etherscan.

- [#3505](https://github.com/wevm/viem/pull/3505) [`c0f36abc39df5fc230c41871da1e7ba6a74d25eb`](https://github.com/wevm/viem/commit/c0f36abc39df5fc230c41871da1e7ba6a74d25eb) Thanks [@clemlak](https://github.com/clemlak)! - Added Multicall3 address to Ink Mainnet.

- [#3506](https://github.com/wevm/viem/pull/3506) [`bce50f08acaa8355b11462487317929d958eb408`](https://github.com/wevm/viem/commit/bce50f08acaa8355b11462487317929d958eb408) Thanks [@CruzMolina](https://github.com/CruzMolina)! - add Multicall3 address to Ink Sepolia

## 2.23.15

### Patch Changes

- [#3490](https://github.com/wevm/viem/pull/3490) [`48851a1e76dd4b5ad6501e1b8c1675005baf0735`](https://github.com/wevm/viem/commit/48851a1e76dd4b5ad6501e1b8c1675005baf0735) Thanks [@biruichen](https://github.com/biruichen)! - Added DBK chain.

- [#3492](https://github.com/wevm/viem/pull/3492) [`35842cf8581e558f456d38f629db97184d96f10f`](https://github.com/wevm/viem/commit/35842cf8581e558f456d38f629db97184d96f10f) Thanks [@falcoda](https://github.com/falcoda)! - add all Juneo primary supernet chains

- [#3493](https://github.com/wevm/viem/pull/3493) [`7a3c20fbcf47d83776dc7f7a8140709b032b1ad9`](https://github.com/wevm/viem/commit/7a3c20fbcf47d83776dc7f7a8140709b032b1ad9) Thanks [@Nish0483](https://github.com/Nish0483)! - Added edeXa testnet and mainnet

## 2.23.14

### Patch Changes

- [#3484](https://github.com/wevm/viem/pull/3484) [`7054ecdcfdc20f6223b59aad5a1036c10ac8e53e`](https://github.com/wevm/viem/commit/7054ecdcfdc20f6223b59aad5a1036c10ac8e53e) Thanks [@falcoda](https://github.com/falcoda)! - Update Juneo Chain Name

- [#3471](https://github.com/wevm/viem/pull/3471) [`68c3ab7c38d0533a4d4a9c260a5e914a82f1ac03`](https://github.com/wevm/viem/commit/68c3ab7c38d0533a4d4a9c260a5e914a82f1ac03) Thanks [@GuillermoEscobero](https://github.com/GuillermoEscobero)! - Added Garfield Testnet, added primary RPCs for Zircuit Mainnet and legacy Testnet

- [#3479](https://github.com/wevm/viem/pull/3479) [`7765eec035995f5ea474aa6394b7f8c38987978e`](https://github.com/wevm/viem/commit/7765eec035995f5ea474aa6394b7f8c38987978e) Thanks [@Volchunovich](https://github.com/Volchunovich)! - Added Hoodi Testnet.

- [#3486](https://github.com/wevm/viem/pull/3486) [`82c565a956fdd1ea29598ec5aeddf00adf014816`](https://github.com/wevm/viem/commit/82c565a956fdd1ea29598ec5aeddf00adf014816) Thanks [@vriveraPeersyst](https://github.com/vriveraPeersyst)! - Added XRPL EVM Devnet.

- [#3481](https://github.com/wevm/viem/pull/3481) [`e3ac382801897615e45a11d095d390d205511edf`](https://github.com/wevm/viem/commit/e3ac382801897615e45a11d095d390d205511edf) Thanks [@Pochetes](https://github.com/Pochetes)! - Added multicall3 contract to Sonic Blaze Testnet.

- [#3485](https://github.com/wevm/viem/pull/3485) [`251858c8cf3787263be0f16220a2e89514052845`](https://github.com/wevm/viem/commit/251858c8cf3787263be0f16220a2e89514052845) Thanks [@vriveraPeersyst](https://github.com/vriveraPeersyst)! - Added XRPL EVM Testnet.

- [#3482](https://github.com/wevm/viem/pull/3482) [`60dbabe8c84a263aef166c969e8062fd1bed89f3`](https://github.com/wevm/viem/commit/60dbabe8c84a263aef166c969e8062fd1bed89f3) Thanks [@falcoda](https://github.com/falcoda)! - Add Socotra JUNE-Chain definition

## 2.23.13

### Patch Changes

- [#3461](https://github.com/wevm/viem/pull/3461) [`18e56ccdc52ad1c51f60ba15ca2771694df44a0a`](https://github.com/wevm/viem/commit/18e56ccdc52ad1c51f60ba15ca2771694df44a0a) Thanks [@Yutaro-Mori-eng](https://github.com/Yutaro-Mori-eng)! - Added Merlin Erigon Testnet.

- [#3458](https://github.com/wevm/viem/pull/3458) [`df2b898d1e48a19634032220ddef9ff2a39aa062`](https://github.com/wevm/viem/commit/df2b898d1e48a19634032220ddef9ff2a39aa062) Thanks [@MicahZoltu](https://github.com/MicahZoltu)! - Added missing re-exports.

- [#3475](https://github.com/wevm/viem/pull/3475) [`cc47bba9fcfb8aa36dc923dbd167db6b27b0fe63`](https://github.com/wevm/viem/commit/cc47bba9fcfb8aa36dc923dbd167db6b27b0fe63) Thanks [@tmm](https://github.com/tmm)! - Swapped defunct Ankr RPC URLs for Thirdweb

## 2.23.12

### Patch Changes

- [#3449](https://github.com/wevm/viem/pull/3449) [`265c681bd2ceb7507cb3f81e0546fc8f98bbc78a`](https://github.com/wevm/viem/commit/265c681bd2ceb7507cb3f81e0546fc8f98bbc78a) Thanks [@adraffy](https://github.com/adraffy)! - Lowercased `sender` in CCIP-read.

- [#3456](https://github.com/wevm/viem/pull/3456) [`6a2b130a7213acfc347a1a804f0fb46106e6361d`](https://github.com/wevm/viem/commit/6a2b130a7213acfc347a1a804f0fb46106e6361d) Thanks [@ly0va](https://github.com/ly0va)! - **ZKsync Extension:** Fixed nullish data encoding.

- [#3455](https://github.com/wevm/viem/pull/3455) [`e4dc49916fc155425ecb3962ca3399c52154bf21`](https://github.com/wevm/viem/commit/e4dc49916fc155425ecb3962ca3399c52154bf21) Thanks [@orenyomtov](https://github.com/orenyomtov)! - Fixed leading zero hex encoding for EIP-7702 transactions.

- [#3457](https://github.com/wevm/viem/pull/3457) [`8560051705a67d1921ab06b0c68bdbd3b6b0ab6c`](https://github.com/wevm/viem/commit/8560051705a67d1921ab06b0c68bdbd3b6b0ab6c) Thanks [@aodhgan](https://github.com/aodhgan)! - Updated Happychain Testnet URLs.

- [#3379](https://github.com/wevm/viem/pull/3379) [`09d61c3f9b4237b696afb5f89b8f489009239e5c`](https://github.com/wevm/viem/commit/09d61c3f9b4237b696afb5f89b8f489009239e5c) Thanks [@danijelTxFusion](https://github.com/danijelTxFusion)! - **ZKSync Extension**: Added `isWithdrawalFinalized` action.

- [#3452](https://github.com/wevm/viem/pull/3452) [`f6a253aff9c9ae70a29fdffb15ae778349699f8e`](https://github.com/wevm/viem/commit/f6a253aff9c9ae70a29fdffb15ae778349699f8e) Thanks [@charlenenicer](https://github.com/charlenenicer)! - Added basecamp testnet chain.

- [#3450](https://github.com/wevm/viem/pull/3450) [`26e8a782ef60f18dcf5469e7dd5a125f7b10d039`](https://github.com/wevm/viem/commit/26e8a782ef60f18dcf5469e7dd5a125f7b10d039) Thanks [@emmaodia](https://github.com/emmaodia)! - Added Somnia Testnet chain

- [`8527569ed4b9704b380c24a11aece9e0475f6b73`](https://github.com/wevm/viem/commit/8527569ed4b9704b380c24a11aece9e0475f6b73) Thanks [@jxom](https://github.com/jxom)! - **Experimental (EIP-5792):** Added `waitForCallsStatus` Action.

## 2.23.11

### Patch Changes

- [#3442](https://github.com/wevm/viem/pull/3442) [`6dda4877ca9081675834fae51f70838ba5441cdf`](https://github.com/wevm/viem/commit/6dda4877ca9081675834fae51f70838ba5441cdf) Thanks [@LordMarkDev](https://github.com/LordMarkDev)! - Updated ZenChain Testnet symbol from ZCX to ZTC.

- [#3447](https://github.com/wevm/viem/pull/3447) [`86f2474255ad6d17bf925ede51fd9466682fd28e`](https://github.com/wevm/viem/commit/86f2474255ad6d17bf925ede51fd9466682fd28e) Thanks [@biruichen](https://github.com/biruichen)! - Added Plume Mainnet.

- [#3445](https://github.com/wevm/viem/pull/3445) [`ea5a0ced1210873df75920b1c9d8afcbc8c6359e`](https://github.com/wevm/viem/commit/ea5a0ced1210873df75920b1c9d8afcbc8c6359e) Thanks [@UnsignedInt8](https://github.com/UnsignedInt8)! - Added assertion for non-null data in `simulateBlocks`.

- [#3438](https://github.com/wevm/viem/pull/3438) [`34152c2fb16f45611fb99718e51952cd212a381c`](https://github.com/wevm/viem/commit/34152c2fb16f45611fb99718e51952cd212a381c) Thanks [@0xxlegolas](https://github.com/0xxlegolas)! - Added Pyrope chain.

- [#3437](https://github.com/wevm/viem/pull/3437) [`988ee7c89e5e9bb49e455704084c826ae3875101`](https://github.com/wevm/viem/commit/988ee7c89e5e9bb49e455704084c826ae3875101) Thanks [@abs3ntdev](https://github.com/abs3ntdev)! - Added nibiru chain

## 2.23.10

### Patch Changes

- [#3432](https://github.com/wevm/viem/pull/3432) [`dd0374c85d8dd7ee79bd13b9e357c84284e113ab`](https://github.com/wevm/viem/commit/dd0374c85d8dd7ee79bd13b9e357c84284e113ab) Thanks [@Yutaro-Mori-eng](https://github.com/Yutaro-Mori-eng)! - Added Seismic Devnet.

- [`9a7e864881e56cfa89c03e1113e6c80e1e3e889d`](https://github.com/wevm/viem/commit/9a7e864881e56cfa89c03e1113e6c80e1e3e889d) Thanks [@jxom](https://github.com/jxom)! - Fixed fee buffer in `prepareUserOperation`.

- [#3393](https://github.com/wevm/viem/pull/3393) [`9c68250e34763019f3dd098a885d9924d7583ad8`](https://github.com/wevm/viem/commit/9c68250e34763019f3dd098a885d9924d7583ad8) Thanks [@allenchuang](https://github.com/allenchuang)! - Added ENS contracts to Story L1.

## 2.23.9

### Patch Changes

- [#3423](https://github.com/wevm/viem/pull/3423) [`b73e8f1e8af0e45f9eb9ea3bc12662f29b72b5f0`](https://github.com/wevm/viem/commit/b73e8f1e8af0e45f9eb9ea3bc12662f29b72b5f0) Thanks [@ccxdev](https://github.com/ccxdev)! - Added Whitechain, WhitechainTestnet chains.

- [#3422](https://github.com/wevm/viem/pull/3422) [`d74ff8ecc756ac490b8957a9c5bee1683f57f617`](https://github.com/wevm/viem/commit/d74ff8ecc756ac490b8957a9c5bee1683f57f617) Thanks [@ivanshukhov](https://github.com/ivanshukhov)! - Added RPC URLs and multicall3 address to Planq.

- [#3421](https://github.com/wevm/viem/pull/3421) [`886bccf2ccf4c272a453a55195177c0e6a2231c1`](https://github.com/wevm/viem/commit/886bccf2ccf4c272a453a55195177c0e6a2231c1) Thanks [@biruichen](https://github.com/biruichen)! - Added MegaETH Testnet.

## 2.23.8

### Patch Changes

- [`34592cd4e518f87c7aa8d91be66fec9edf1cfc19`](https://github.com/wevm/viem/commit/34592cd4e518f87c7aa8d91be66fec9edf1cfc19) Thanks [@jxom](https://github.com/jxom)! - Exported `Call` and `Calls` types.

- [#3419](https://github.com/wevm/viem/pull/3419) [`1893b8f927de562f842a9d256ea6e66a0cf65a67`](https://github.com/wevm/viem/commit/1893b8f927de562f842a9d256ea6e66a0cf65a67) Thanks [@rizwanmoulvi](https://github.com/rizwanmoulvi)! - Added Edu Chain to chains.

## 2.23.7

### Patch Changes

- [#3417](https://github.com/wevm/viem/pull/3417) [`ea771358624e71af8ca4082212c7a4534e872a32`](https://github.com/wevm/viem/commit/ea771358624e71af8ca4082212c7a4534e872a32) Thanks [@Kharabet](https://github.com/Kharabet)! - Updated GuruNetwork RPC URLs.

- [#3408](https://github.com/wevm/viem/pull/3408) [`07ade80570c62ade8ef51ede7ad33c5832aa1e9e`](https://github.com/wevm/viem/commit/07ade80570c62ade8ef51ede7ad33c5832aa1e9e) Thanks [@falcoda](https://github.com/falcoda)! - Added Juneo Mainnet chain.

- [`9c442de0ff38ac1f654b5c751d292e9a9f8d574c`](https://github.com/wevm/viem/commit/9c442de0ff38ac1f654b5c751d292e9a9f8d574c) Thanks [@jxom](https://github.com/jxom)! - Fixed `encodeFunctionResult` behavior. Fixes #3415.

- [#3418](https://github.com/wevm/viem/pull/3418) [`92a3ac61fc7b3f805583ac8573086f3b349da470`](https://github.com/wevm/viem/commit/92a3ac61fc7b3f805583ac8573086f3b349da470) Thanks [@deodad](https://github.com/deodad)! - Exported `WaitForTransactionReceiptTimeoutErrorType` to `WaitForTransactionReceiptErrorType`.

- [#3397](https://github.com/wevm/viem/pull/3397) [`00d46cfb4a9993d3bd6ec7cc9c240c9a8368b7c4`](https://github.com/wevm/viem/commit/00d46cfb4a9993d3bd6ec7cc9c240c9a8368b7c4) Thanks [@sumitvekariya](https://github.com/sumitvekariya)! - Fixed deployment transactions for EIP-7702.

- [#3411](https://github.com/wevm/viem/pull/3411) [`ddb7e184dab8e80bf1137d3258db44662e433476`](https://github.com/wevm/viem/commit/ddb7e184dab8e80bf1137d3258db44662e433476) Thanks [@akitothemoon](https://github.com/akitothemoon)! - Added Status Sepolia.

- [#3414](https://github.com/wevm/viem/pull/3414) [`71b90034fc087780e4794553a53bd98c6955ebe3`](https://github.com/wevm/viem/commit/71b90034fc087780e4794553a53bd98c6955ebe3) Thanks [@spalladino](https://github.com/spalladino)! - Added `shouldThrow` option to `fallback` transport.

## 2.23.6

### Patch Changes

- [#3389](https://github.com/wevm/viem/pull/3389) [`2159ca08722d90e854f36921eb200efbefc0734f`](https://github.com/wevm/viem/commit/2159ca08722d90e854f36921eb200efbefc0734f) Thanks [@yogaajs](https://github.com/yogaajs)! - Fixed handling of malformed JSON on WebSocket RPC.

- [#3386](https://github.com/wevm/viem/pull/3386) [`5f738071c2c0e3d8bb0a5193b3b928403a8af2a4`](https://github.com/wevm/viem/commit/5f738071c2c0e3d8bb0a5193b3b928403a8af2a4) Thanks [@jiggyBu](https://github.com/jiggyBu)! - Updated real chain default RPC node

- [#3396](https://github.com/wevm/viem/pull/3396) [`8dc421e7f7c0400b8aa5861f1f5a18cd1b3613b1`](https://github.com/wevm/viem/commit/8dc421e7f7c0400b8aa5861f1f5a18cd1b3613b1) Thanks [@deodad](https://github.com/deodad)! - Added `raw` option to `http` transport.

- [#3400](https://github.com/wevm/viem/pull/3400) [`0165c5f1b2fe4a804967bda3a749b8d289c129f2`](https://github.com/wevm/viem/commit/0165c5f1b2fe4a804967bda3a749b8d289c129f2) Thanks [@bearpong](https://github.com/bearpong)! - Added Berachain Bepolia.

- [#3387](https://github.com/wevm/viem/pull/3387) [`48fd9180edea77b0abe974f83588b7bbcba8854c`](https://github.com/wevm/viem/commit/48fd9180edea77b0abe974f83588b7bbcba8854c) Thanks [@emanuelconunaemme](https://github.com/emanuelconunaemme)! - Updated saga chain.

- [#3402](https://github.com/wevm/viem/pull/3402) [`892d0bc1f0c804dfe3015c9550fff37c19799eb5`](https://github.com/wevm/viem/commit/892d0bc1f0c804dfe3015c9550fff37c19799eb5) Thanks [@poplexity](https://github.com/poplexity)! - Updated Telos RPC URLs.

- [#3382](https://github.com/wevm/viem/pull/3382) [`186c4add2df2ead16bacead3dee6397f6a737f5d`](https://github.com/wevm/viem/commit/186c4add2df2ead16bacead3dee6397f6a737f5d) Thanks [@Yutaro-Mori-eng](https://github.com/Yutaro-Mori-eng)! - Added Fluent Testnet.

## 2.23.5

### Patch Changes

- [#3374](https://github.com/wevm/viem/pull/3374) [`70ec80cbd9879672ba9cc0a3033648f06052f21a`](https://github.com/wevm/viem/commit/70ec80cbd9879672ba9cc0a3033648f06052f21a) Thanks [@teimurjan](https://github.com/teimurjan)! - Added Form and Form Testnet chains.

- [#3375](https://github.com/wevm/viem/pull/3375) [`563ad1e7b60584d85e06dca7f3b0e7115e5e0428`](https://github.com/wevm/viem/commit/563ad1e7b60584d85e06dca7f3b0e7115e5e0428) Thanks [@abbas9344](https://github.com/abbas9344)! - Added Zero Network.

- [#3378](https://github.com/wevm/viem/pull/3378) [`2bea96d68ae7c89d06ea21c7dd20878926f3d469`](https://github.com/wevm/viem/commit/2bea96d68ae7c89d06ea21c7dd20878926f3d469) Thanks [@AmanRaj1608](https://github.com/AmanRaj1608)! - Added sonic blaze testnet.

## 2.23.4

### Patch Changes

- [`efcdc57e504a8469c63f944c28ff92e8095b43ad`](https://github.com/wevm/viem/commit/efcdc57e504a8469c63f944c28ff92e8095b43ad) Thanks [@jxom](https://github.com/jxom)! - **Experimental(ERC-5792):** Added support for nullish `account` in `sendCalls`.

- [#3364](https://github.com/wevm/viem/pull/3364) [`e7f329941da463c1e1a4c69bbdcd73e34a744cf4`](https://github.com/wevm/viem/commit/e7f329941da463c1e1a4c69bbdcd73e34a744cf4) Thanks [@biruichen](https://github.com/biruichen)! - Added Ethernity Mainnet.

- [#3369](https://github.com/wevm/viem/pull/3369) [`307ec81ca7c50d928e9f2243be32490aba28894f`](https://github.com/wevm/viem/commit/307ec81ca7c50d928e9f2243be32490aba28894f) Thanks [@GalaxySciTech](https://github.com/GalaxySciTech)! - Updated XDC Name.

## 2.23.3

### Patch Changes

- [#3340](https://github.com/wevm/viem/pull/3340) [`66e5f6ab7b683a90775dcb8fae340e3154d74b38`](https://github.com/wevm/viem/commit/66e5f6ab7b683a90775dcb8fae340e3154d74b38) Thanks [@biruichen](https://github.com/biruichen)! - Added B3 multicall3.

- [#3358](https://github.com/wevm/viem/pull/3358) [`8c62103fb556811d907d5bc588a5e9e6583aef3a`](https://github.com/wevm/viem/commit/8c62103fb556811d907d5bc588a5e9e6583aef3a) Thanks [@Yutaro-Mori-eng](https://github.com/Yutaro-Mori-eng)! - Added Newton chain.

- [#3360](https://github.com/wevm/viem/pull/3360) [`efa225262009297481d57f733e7b2c7e0b3a6ff1`](https://github.com/wevm/viem/commit/efa225262009297481d57f733e7b2c7e0b3a6ff1) Thanks [@smartcontracts](https://github.com/smartcontracts)! - **OP Stack:** Added support for `LegacyGame` error.

- [#3359](https://github.com/wevm/viem/pull/3359) [`599818833dfc3778e723f94194ad6afc331e3afe`](https://github.com/wevm/viem/commit/599818833dfc3778e723f94194ad6afc331e3afe) Thanks [@mubaris](https://github.com/mubaris)! - Added Polynomial network.

- [#3349](https://github.com/wevm/viem/pull/3349) [`322a2eb66579fec2ba48b1d3e37d6d1973965b1e`](https://github.com/wevm/viem/commit/322a2eb66579fec2ba48b1d3e37d6d1973965b1e) Thanks [@Yutaro-Mori-eng](https://github.com/Yutaro-Mori-eng)! - Added Lumoz Mainnet & Testnet.

- [#3352](https://github.com/wevm/viem/pull/3352) [`3fc5f865951b17ccf5a39a906d26a432a9bdacde`](https://github.com/wevm/viem/commit/3fc5f865951b17ccf5a39a906d26a432a9bdacde) Thanks [@biruichen](https://github.com/biruichen)! - Added Haust Network Testnet.

- [#3266](https://github.com/wevm/viem/pull/3266) [`8500cf942ee868c9b871df91b3e536535b6325ee`](https://github.com/wevm/viem/commit/8500cf942ee868c9b871df91b3e536535b6325ee) Thanks [@danijelTxFusion](https://github.com/danijelTxFusion)! - Added `finalizeWithdrawal` action in the ZKsync extension

- [#3348](https://github.com/wevm/viem/pull/3348) [`d0ead40b277d0d8094e654d20df903e4e92a551a`](https://github.com/wevm/viem/commit/d0ead40b277d0d8094e654d20df903e4e92a551a) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Added Peaq chain.

- [#3353](https://github.com/wevm/viem/pull/3353) [`f85f6d9d5aaf32668718819803c3d60148d8df07`](https://github.com/wevm/viem/commit/f85f6d9d5aaf32668718819803c3d60148d8df07) Thanks [@abbas9344](https://github.com/abbas9344)! - Added multicall3 contract to Berachain Artio.

- [#3357](https://github.com/wevm/viem/pull/3357) [`6489a7217c028f46dd3aaa2d72aa0d870bb6630a`](https://github.com/wevm/viem/commit/6489a7217c028f46dd3aaa2d72aa0d870bb6630a) Thanks [@0xArdy](https://github.com/0xArdy)! - Fixed `disputeGameFactory` contract address in World Chain

- [#3350](https://github.com/wevm/viem/pull/3350) [`a2368df1e539b5157bcb79479783c26f0f85192c`](https://github.com/wevm/viem/commit/a2368df1e539b5157bcb79479783c26f0f85192c) Thanks [@tomiir](https://github.com/tomiir)! - Fixed Donatuz network RPC URL

- [#3354](https://github.com/wevm/viem/pull/3354) [`eec264fe99b6433e2320161366e6a82a65350d76`](https://github.com/wevm/viem/commit/eec264fe99b6433e2320161366e6a82a65350d76) Thanks [@rasplarry](https://github.com/rasplarry)! - Added Story Aeneid chain.

## 2.23.2

### Patch Changes

- [#3336](https://github.com/wevm/viem/pull/3336) [`bfa1e95421ea334d3e6434bb5811cb5600b1c457`](https://github.com/wevm/viem/commit/bfa1e95421ea334d3e6434bb5811cb5600b1c457) Thanks [@vittominacori](https://github.com/vittominacori)! - Updated Unichain currency name.

- [#3337](https://github.com/wevm/viem/pull/3337) [`e92aad6c5a339e79e7da6af3d17a4b3b65b83564`](https://github.com/wevm/viem/commit/e92aad6c5a339e79e7da6af3d17a4b3b65b83564) Thanks [@Yutaro-Mori-eng](https://github.com/Yutaro-Mori-eng)! - Added Pumpfi Testnet.

- [#3339](https://github.com/wevm/viem/pull/3339) [`cdad6f36c010f4f42452da1186102e23e8a18a8d`](https://github.com/wevm/viem/commit/cdad6f36c010f4f42452da1186102e23e8a18a8d) Thanks [@0xArdy](https://github.com/0xArdy)! - Added Unichain OP Stack config.

## 2.23.1

### Patch Changes

- [`dee7aa693027b5a5324b77c32be64a2f50a1e2ab`](https://github.com/wevm/viem/commit/dee7aa693027b5a5324b77c32be64a2f50a1e2ab) Thanks [@jxom](https://github.com/jxom)! - Fixed issue where `fallback` transports would not adhere to transport method allow/denylists when falling through.

- [#3332](https://github.com/wevm/viem/pull/3332) [`349cdbef6cd0eacde5ee680321652c494124852c`](https://github.com/wevm/viem/commit/349cdbef6cd0eacde5ee680321652c494124852c) Thanks [@cbachmeier](https://github.com/cbachmeier)! - Added Unichain.

## 2.23.0

### Minor Changes

- [#3326](https://github.com/wevm/viem/pull/3326) [`5c06bfa8c66c8e1c8db75d7cb9b51284c4e68bd0`](https://github.com/wevm/viem/commit/5c06bfa8c66c8e1c8db75d7cb9b51284c4e68bd0) Thanks [@jxom](https://github.com/jxom)! - Added `simulateCalls` Action. [Docs](https://viem.sh/docs/actions/public/simulateCalls)

### Patch Changes

- [#3321](https://github.com/wevm/viem/pull/3321) [`120610889383e0a4bc50e88fd04a98cf8e372b7e`](https://github.com/wevm/viem/commit/120610889383e0a4bc50e88fd04a98cf8e372b7e) Thanks [@biruichen](https://github.com/biruichen)! - Added Story Mainnet.

- [#3324](https://github.com/wevm/viem/pull/3324) [`0a32b1e3ea3795fc91b4254ca001981626888abd`](https://github.com/wevm/viem/commit/0a32b1e3ea3795fc91b4254ca001981626888abd) Thanks [@Yutaro-Mori-eng](https://github.com/Yutaro-Mori-eng)! - Added 0G Newton Testnet.

- [#3325](https://github.com/wevm/viem/pull/3325) [`f68da13342a8ceea434dce6cd61fef508ae946bb`](https://github.com/wevm/viem/commit/f68da13342a8ceea434dce6cd61fef508ae946bb) Thanks [@lethaale](https://github.com/lethaale)! - Added ENS contracts to Berachain L1.

- [#3322](https://github.com/wevm/viem/pull/3322) [`01a74e95271e98d4ff3771fc8c3515978fe8b22e`](https://github.com/wevm/viem/commit/01a74e95271e98d4ff3771fc8c3515978fe8b22e) Thanks [@vittominacori](https://github.com/vittominacori)! - Updated Worldchain Sepolia.

## 2.22.23

### Patch Changes

- [#3319](https://github.com/wevm/viem/pull/3319) [`099e7dded0fe1be817a30b9a8706eda017f1cf5a`](https://github.com/wevm/viem/commit/099e7dded0fe1be817a30b9a8706eda017f1cf5a) Thanks [@nidhinakranii](https://github.com/nidhinakranii)! - Added Metis Sepolia testnet chain and deprecated metisGoerli

- [#3315](https://github.com/wevm/viem/pull/3315) [`c39d2896ba08fc8804268c5456d14cd9794c4e23`](https://github.com/wevm/viem/commit/c39d2896ba08fc8804268c5456d14cd9794c4e23) Thanks [@michelebruno](https://github.com/michelebruno)! - Added Berachain multicall.

- [#3320](https://github.com/wevm/viem/pull/3320) [`3c37c4b800f5fa6a9932d0dbbad619db5aa55a8b`](https://github.com/wevm/viem/commit/3c37c4b800f5fa6a9932d0dbbad619db5aa55a8b) Thanks [@yongjun925](https://github.com/yongjun925)! - Added Birdlayer Chain.

- [#3311](https://github.com/wevm/viem/pull/3311) [`149d4060d9d71a1fa2c106bfc3c5c817dba9860c`](https://github.com/wevm/viem/commit/149d4060d9d71a1fa2c106bfc3c5c817dba9860c) Thanks [@hello-jdj](https://github.com/hello-jdj)! - Added HashKey Chain.

- [#3313](https://github.com/wevm/viem/pull/3313) [`15bec5dce10fabb451ddf25e6682082f77b7c631`](https://github.com/wevm/viem/commit/15bec5dce10fabb451ddf25e6682082f77b7c631) Thanks [@holic](https://github.com/holic)! - Closed socket on cleanup for RPC transport.

## 2.22.22

### Patch Changes

- [#3302](https://github.com/wevm/viem/pull/3302) [`745009588fc11398c54dc289d30ea4d86fef9303`](https://github.com/wevm/viem/commit/745009588fc11398c54dc289d30ea4d86fef9303) Thanks [@NicolasMahe](https://github.com/NicolasMahe)! - Added multicall3 to LightLink definition

- [#3310](https://github.com/wevm/viem/pull/3310) [`07b4f5d7cf884731e3a1a36d3366c79a0ec98276`](https://github.com/wevm/viem/commit/07b4f5d7cf884731e3a1a36d3366c79a0ec98276) Thanks [@eswarasai](https://github.com/eswarasai)! - Updated Botanix Testnet details

- [#3301](https://github.com/wevm/viem/pull/3301) [`c3c56f8860fd22c5eadd04335a9cac26567e06c3`](https://github.com/wevm/viem/commit/c3c56f8860fd22c5eadd04335a9cac26567e06c3) Thanks [@pk-850](https://github.com/pk-850)! - Added Monad Testnet.

- [#3309](https://github.com/wevm/viem/pull/3309) [`b354ba43be530f55c52fc9162ebcbb9d7210d9ce`](https://github.com/wevm/viem/commit/b354ba43be530f55c52fc9162ebcbb9d7210d9ce) Thanks [@RealWooblay](https://github.com/RealWooblay)! - Updated xrOne chain details.

## 2.22.21

### Patch Changes

- [`c822da1966220bb80eda9b00d47829bf23e29761`](https://github.com/wevm/viem/commit/c822da1966220bb80eda9b00d47829bf23e29761) Thanks [@jxom](https://github.com/jxom)! - Fixed ERC-7821 `getExecuteError` return type.

## 2.22.20

### Patch Changes

- [#3296](https://github.com/wevm/viem/pull/3296) [`41aab4288372b3e7a6591113be833b9c2aed6f40`](https://github.com/wevm/viem/commit/41aab4288372b3e7a6591113be833b9c2aed6f40) Thanks [@hello-jdj](https://github.com/hello-jdj)! - Added Donatuz network.

- [`06f3deebc3b185b605eb79e5785bfbe2a6b8297c`](https://github.com/wevm/viem/commit/06f3deebc3b185b605eb79e5785bfbe2a6b8297c) Thanks [@jxom](https://github.com/jxom)! - Added ERC-7821 utilities.

- [#3299](https://github.com/wevm/viem/pull/3299) [`d21dec69e6b8abfd279136f15817477c4f2fd646`](https://github.com/wevm/viem/commit/d21dec69e6b8abfd279136f15817477c4f2fd646) Thanks [@camiinthisthang](https://github.com/camiinthisthang)! - Added Berachain.

## 2.22.19

### Patch Changes

- [#3291](https://github.com/wevm/viem/pull/3291) [`4e53750f4e84486bcfcb35382cf6150438468d35`](https://github.com/wevm/viem/commit/4e53750f4e84486bcfcb35382cf6150438468d35) Thanks [@biruichen](https://github.com/biruichen)! - Added Sidra Chain.

- [#3292](https://github.com/wevm/viem/pull/3292) [`d6388d78a20dac91ffc6196a79fdaea13c749c59`](https://github.com/wevm/viem/commit/d6388d78a20dac91ffc6196a79fdaea13c749c59) Thanks [@pk-850](https://github.com/pk-850)! - Added Multicall address to Songbird Canary-Network.

- [#3293](https://github.com/wevm/viem/pull/3293) [`f3746922322ee2d8209a951ffae7d2e6dbcccca1`](https://github.com/wevm/viem/commit/f3746922322ee2d8209a951ffae7d2e6dbcccca1) Thanks [@jxom](https://github.com/jxom)! - Added ERC-7821 `executeBatches` for "batch of batches" execution mode.

## 2.22.18

### Patch Changes

- [#3287](https://github.com/wevm/viem/pull/3287) [`9a7bc6e354b9ef8ca3baeb6a4538d5564ccf08a5`](https://github.com/wevm/viem/commit/9a7bc6e354b9ef8ca3baeb6a4538d5564ccf08a5) Thanks [@hello-jdj](https://github.com/hello-jdj)! - Added Forta Chain.

- [#3288](https://github.com/wevm/viem/pull/3288) [`3a7fba472a24f4cf8ff68172dc40ed7358e9b691`](https://github.com/wevm/viem/commit/3a7fba472a24f4cf8ff68172dc40ed7358e9b691) Thanks [@dmitrii602](https://github.com/dmitrii602)! - Added WMC Testnet chain.

- [`68f00d39d40d16eb8408c441d79aa264e5e2149b`](https://github.com/wevm/viem/commit/68f00d39d40d16eb8408c441d79aa264e5e2149b) Thanks [@jxom](https://github.com/jxom)! - Fixed `simulate` data decoding.

## 2.22.17

### Patch Changes

- [`3f8859f52132158fcb721c416ba17424c5c1bc9d`](https://github.com/wevm/viem/commit/3f8859f52132158fcb721c416ba17424c5c1bc9d) Thanks [@jxom](https://github.com/jxom)! - Fixed issue where Transports were falling back on execution errors.

## 2.22.16

### Patch Changes

- [#3280](https://github.com/wevm/viem/pull/3280) [`bc2028ba8359f5d9dbf705b1b8989579d4f17ff4`](https://github.com/wevm/viem/commit/bc2028ba8359f5d9dbf705b1b8989579d4f17ff4) Thanks [@biruichen](https://github.com/biruichen)! - Added ETP Mainnet.

- [`85344994ebaf286a2680dab886c037e73a24da11`](https://github.com/wevm/viem/commit/85344994ebaf286a2680dab886c037e73a24da11) Thanks [@jxom](https://github.com/jxom)! - Removed redundant `eth_getBlockByNumber` calls.

- [#3282](https://github.com/wevm/viem/pull/3282) [`3bf349e78319b248010b9c0f40d77acbb6cb8a2e`](https://github.com/wevm/viem/commit/3bf349e78319b248010b9c0f40d77acbb6cb8a2e) Thanks [@aodhgan](https://github.com/aodhgan)! - Added Happychain testnet

## 2.22.15

### Patch Changes

- [#3277](https://github.com/wevm/viem/pull/3277) [`b5eadf8c14cf6578aaeb82b1ff78f3b12a600a7b`](https://github.com/wevm/viem/commit/b5eadf8c14cf6578aaeb82b1ff78f3b12a600a7b) Thanks [@Duncan-Ultra](https://github.com/Duncan-Ultra)! - Added Ultra EVM Mainnet chain

- [#3275](https://github.com/wevm/viem/pull/3275) [`3b21f1ad5c5679d557457144c28e089e1459373b`](https://github.com/wevm/viem/commit/3b21f1ad5c5679d557457144c28e089e1459373b) Thanks [@holic](https://github.com/holic)! - Removed hash on request cache key.

- [`1d01f826777c98274326f321952beadb753ea243`](https://github.com/wevm/viem/commit/1d01f826777c98274326f321952beadb753ea243) Thanks [@jxom](https://github.com/jxom)! - Fixed `encodeEventTopics` for zeroish arguments.

## 2.22.14

### Patch Changes

- [#3271](https://github.com/wevm/viem/pull/3271) [`4042055c43015e8181448af37bdf79caa28f3665`](https://github.com/wevm/viem/commit/4042055c43015e8181448af37bdf79caa28f3665) Thanks [@0xartcro](https://github.com/0xartcro)! - Added cronos zkEVM multicall3

- [`7973e0c9a50e2af82ab2f12025be10c36d4df5c7`](https://github.com/wevm/viem/commit/7973e0c9a50e2af82ab2f12025be10c36d4df5c7) Thanks [@jxom](https://github.com/jxom)! - Added Hemi chain.

- [#3267](https://github.com/wevm/viem/pull/3267) [`c9e411879c6123beef2c6ea89dc25d71e8a0a9e3`](https://github.com/wevm/viem/commit/c9e411879c6123beef2c6ea89dc25d71e8a0a9e3) Thanks [@hello-jdj](https://github.com/hello-jdj)! - Added PremiumBlock Testnet.

## 2.22.13

### Patch Changes

- [#3259](https://github.com/wevm/viem/pull/3259) [`2f63f9a8a2c1b3057a32024854e7a9e52e675acd`](https://github.com/wevm/viem/commit/2f63f9a8a2c1b3057a32024854e7a9e52e675acd) Thanks [@MaryBecky](https://github.com/MaryBecky)! - Added InitVerse Mainnet.

- [#3261](https://github.com/wevm/viem/pull/3261) [`00350defbb9aed1daca91bd4411db9a5b4d56e96`](https://github.com/wevm/viem/commit/00350defbb9aed1daca91bd4411db9a5b4d56e96) Thanks [@fe-dudu](https://github.com/fe-dudu)! - Updated creditcoin3 testnet rpcUrls

- [`a1e17d0be7a04755cbb55a46ae80218a5c2f253c`](https://github.com/wevm/viem/commit/a1e17d0be7a04755cbb55a46ae80218a5c2f253c) Thanks [@jxom](https://github.com/jxom)! - Added ability for Coinbase Smart Account owners to be `Address`.

- [`2e687185aa91210b40557f5b5effd916a29f2e45`](https://github.com/wevm/viem/commit/2e687185aa91210b40557f5b5effd916a29f2e45) Thanks [@jxom](https://github.com/jxom)! - Bumped dependencies.

## 2.22.12

### Patch Changes

- [#3256](https://github.com/wevm/viem/pull/3256) [`5fb0e52bc076001bb6e8c9b8d2b2a18e8238309c`](https://github.com/wevm/viem/commit/5fb0e52bc076001bb6e8c9b8d2b2a18e8238309c) Thanks [@franciscotobar](https://github.com/franciscotobar)! - Added multicall3 to Rootstock Testnet chain

- [#3255](https://github.com/wevm/viem/pull/3255) [`f36fcb9bb5a627c4ddc8b4312d2d685ca9edecce`](https://github.com/wevm/viem/commit/f36fcb9bb5a627c4ddc8b4312d2d685ca9edecce) Thanks [@neilydhan](https://github.com/neilydhan)! - Added Reddio Sepolia.

- [#3250](https://github.com/wevm/viem/pull/3250) [`9ae2d59b055e5a51cd30e42c7e2bce378a2ce483`](https://github.com/wevm/viem/commit/9ae2d59b055e5a51cd30e42c7e2bce378a2ce483) Thanks [@jonathangus](https://github.com/jonathangus)! - Add Lens Testnet chains

- [#3251](https://github.com/wevm/viem/pull/3251) [`7475fdbd33a7d6bb7083b54cf8e91d66df104e4c`](https://github.com/wevm/viem/commit/7475fdbd33a7d6bb7083b54cf8e91d66df104e4c) Thanks [@allan-wei-tx](https://github.com/allan-wei-tx)! - Added bitlayer mainnet & testnet `multicall3` address.

- [#3254](https://github.com/wevm/viem/pull/3254) [`99812b9915cb06e98c1370f0d33448b36d5c7636`](https://github.com/wevm/viem/commit/99812b9915cb06e98c1370f0d33448b36d5c7636) Thanks [@fe-dudu](https://github.com/fe-dudu)! - Added creditcoin3 chain.

- [#3258](https://github.com/wevm/viem/pull/3258) [`f32fc924cad24d4aace31f9d41f1a020e3cf11d9`](https://github.com/wevm/viem/commit/f32fc924cad24d4aace31f9d41f1a020e3cf11d9) Thanks [@will-af](https://github.com/will-af)! - Added `raw` property to `ContractFunctionRevertedError` for raw revert data.

## 2.22.11

### Patch Changes

- [#3242](https://github.com/wevm/viem/pull/3242) [`2a2239e0b4efd8a62121ac87fcb17931cd403c16`](https://github.com/wevm/viem/commit/2a2239e0b4efd8a62121ac87fcb17931cd403c16) Thanks [@Duncan-Ultra](https://github.com/Duncan-Ultra)! - Added Ultra EVM Testnet chain

- [#3246](https://github.com/wevm/viem/pull/3246) [`6a3e4073b018eb7b7f40aa420f89c1b376301227`](https://github.com/wevm/viem/commit/6a3e4073b018eb7b7f40aa420f89c1b376301227) Thanks [@aliberkhsl](https://github.com/aliberkhsl)! - Added Swellchain.

## 2.22.10

### Patch Changes

- [#3236](https://github.com/wevm/viem/pull/3236) [`23c95989ec60fa4879e94d6f8b907bd50e75060c`](https://github.com/wevm/viem/commit/23c95989ec60fa4879e94d6f8b907bd50e75060c) Thanks [@abs3ntdev](https://github.com/abs3ntdev)! - Added goat network.

- [#3221](https://github.com/wevm/viem/pull/3221) [`15ab5eef4636457bbee03e1e1166e7604ed78859`](https://github.com/wevm/viem/commit/15ab5eef4636457bbee03e1e1166e7604ed78859) Thanks [@danijelTxFusion](https://github.com/danijelTxFusion)! - **ZKsync Extension:** Added `withdraw` action.

- [#3233](https://github.com/wevm/viem/pull/3233) [`e4fd731992c7230deaf29dc8ea36df42d89e012f`](https://github.com/wevm/viem/commit/e4fd731992c7230deaf29dc8ea36df42d89e012f) Thanks [@ggawryal](https://github.com/ggawryal)! - Added Aleph Zero Testnet chain.

- [#3238](https://github.com/wevm/viem/pull/3238) [`28ff8090410e5355609bfb402989c78f6a521cff`](https://github.com/wevm/viem/commit/28ff8090410e5355609bfb402989c78f6a521cff) Thanks [@jxom](https://github.com/jxom)! - Added `methods` property to `http`, `ipc`, and `webSocket` transports to include or exclude RPC methods from being executed.

## 2.22.9

### Patch Changes

- [#3232](https://github.com/wevm/viem/pull/3232) [`e1df486b02e62a9a9890752d42141671c0f37e25`](https://github.com/wevm/viem/commit/e1df486b02e62a9a9890752d42141671c0f37e25) Thanks [@jxom](https://github.com/jxom)! - Upgraded WebAuthn Accounts to use `ox` instead of `webauthn-p256`.

- [#3226](https://github.com/wevm/viem/pull/3226) [`6f1e1090d2e3513b3e1056482b4caefa2f02235e`](https://github.com/wevm/viem/commit/6f1e1090d2e3513b3e1056482b4caefa2f02235e) Thanks [@Maar-io](https://github.com/Maar-io)! - Adding Soneium mainnet

- [#3228](https://github.com/wevm/viem/pull/3228) [`06316558a3a968acd216d241fc76a956a6b062b4`](https://github.com/wevm/viem/commit/06316558a3a968acd216d241fc76a956a6b062b4) Thanks [@hello-jdj](https://github.com/hello-jdj)! - Added Arthera Testnet.

- [#3224](https://github.com/wevm/viem/pull/3224) [`1a235e6cb2b6aaf61c69e1ac4c24f3c4f0e383ac`](https://github.com/wevm/viem/commit/1a235e6cb2b6aaf61c69e1ac4c24f3c4f0e383ac) Thanks [@paouvrard](https://github.com/paouvrard)! - Added NEAR Protocol chains.

## 2.22.8

### Patch Changes

- [#3216](https://github.com/wevm/viem/pull/3216) [`7ad24ff6cb1770a1f5ad4d9c99bfee9fd99b12b5`](https://github.com/wevm/viem/commit/7ad24ff6cb1770a1f5ad4d9c99bfee9fd99b12b5) Thanks [@Hebx](https://github.com/Hebx)! - Added Citrea Testnet chain.

## 2.22.7

### Patch Changes

- [#3164](https://github.com/wevm/viem/pull/3164) [`8160d4212c496be8857e84ed2501a6956b1a3ead`](https://github.com/wevm/viem/commit/8160d4212c496be8857e84ed2501a6956b1a3ead) Thanks [@danijelTxFusion](https://github.com/danijelTxFusion)! - **ZKSync Extension:** Added `requestExecute` wallet action and `getL2HashFromPriorityOp` utility function.

- [#3213](https://github.com/wevm/viem/pull/3213) [`6b44506c15dd7a1635cb36e46149e0617cf2926e`](https://github.com/wevm/viem/commit/6b44506c15dd7a1635cb36e46149e0617cf2926e) Thanks [@Gwen-M](https://github.com/Gwen-M)! - Deprecated Linea Goerli chain.

## 2.22.6

### Patch Changes

- [#3209](https://github.com/wevm/viem/pull/3209) [`b0971fa96103094fb71447f36e43a034c465b80b`](https://github.com/wevm/viem/commit/b0971fa96103094fb71447f36e43a034c465b80b) Thanks [@hello-jdj](https://github.com/hello-jdj)! - Added Multicall address to Kroma.

- [#3212](https://github.com/wevm/viem/pull/3212) [`14d850b1cb45474cd76e60fa0785d8e9c57ddb4b`](https://github.com/wevm/viem/commit/14d850b1cb45474cd76e60fa0785d8e9c57ddb4b) Thanks [@wei-b0](https://github.com/wei-b0)! - Added Huddle01 chain.

- [`fd17ba92ee54af65a841823daab58991bfeb76c0`](https://github.com/wevm/viem/commit/fd17ba92ee54af65a841823daab58991bfeb76c0) Thanks [@jxom](https://github.com/jxom)! - **Experimental(EIP-7702):** Renamed `delegate` to `sponsor` on `signAuthorization`.

## 2.22.5

### Patch Changes

- [#3101](https://github.com/wevm/viem/pull/3101) [`e934c8b4f159952aaa5dd1f310cc249f9a298c57`](https://github.com/wevm/viem/commit/e934c8b4f159952aaa5dd1f310cc249f9a298c57) Thanks [@lethaale](https://github.com/lethaale)! - Added ENS contract addresses to Berachain bArtio.

- [#3204](https://github.com/wevm/viem/pull/3204) [`be5516f7eba924da5d4b14fa0ce0bc3c0c9e6bc4`](https://github.com/wevm/viem/commit/be5516f7eba924da5d4b14fa0ce0bc3c0c9e6bc4) Thanks [@hamdiallam](https://github.com/hamdiallam)! - **OP Stack:** Added `proofSubmitter` parameter to `finalizeWithdrawal` for finalizing withdrawals under a different account.

- [#3203](https://github.com/wevm/viem/pull/3203) [`8c0597dbfb9b617aee72db6f8f9d13a9c4de4fbe`](https://github.com/wevm/viem/commit/8c0597dbfb9b617aee72db6f8f9d13a9c4de4fbe) Thanks [@bthaile](https://github.com/bthaile)! - Updated Flow Mainnet and Testnet block explorer URLs.

- [#3207](https://github.com/wevm/viem/pull/3207) [`b87dd30ef8a0d07de7f553ef0b69892e787e19d7`](https://github.com/wevm/viem/commit/b87dd30ef8a0d07de7f553ef0b69892e787e19d7) Thanks [@metarsit](https://github.com/metarsit)! - Updated Abstract Testnet block explorer to use etherscan.

- [#3117](https://github.com/wevm/viem/pull/3117) [`99706e7a3867be9590d28ede69244f3e1741c830`](https://github.com/wevm/viem/commit/99706e7a3867be9590d28ede69244f3e1741c830) Thanks [@piersy](https://github.com/piersy)! - **Celo:** Added support for gas price estimation on both Celo L1 and Celo L2.

- [#3208](https://github.com/wevm/viem/pull/3208) [`1e868dd0878f7c2010337c6712642e9b80167f46`](https://github.com/wevm/viem/commit/1e868dd0878f7c2010337c6712642e9b80167f46) Thanks [@akshat-zeeve](https://github.com/akshat-zeeve)! - Added Ternoa chain.

## 2.22.4

### Patch Changes

- [#3196](https://github.com/wevm/viem/pull/3196) [`fad94b76ec2bfd44331f39ef7e564ef15c28a004`](https://github.com/wevm/viem/commit/fad94b76ec2bfd44331f39ef7e564ef15c28a004) Thanks [@pursonc](https://github.com/pursonc)! - Added exSat chain.

- [#3194](https://github.com/wevm/viem/pull/3194) [`497fa72642f39725bc1364e2164ccc8b16e8131d`](https://github.com/wevm/viem/commit/497fa72642f39725bc1364e2164ccc8b16e8131d) Thanks [@davidenwang](https://github.com/davidenwang)! - Fixed transaction reprice logic in `waitForTransactionReceipt` to account for `transaction.input` as well.

- [#3202](https://github.com/wevm/viem/pull/3202) [`344bcaf605f43b748e53a3e121d049c8cae0ed75`](https://github.com/wevm/viem/commit/344bcaf605f43b748e53a3e121d049c8cae0ed75) Thanks [@abs3ntdev](https://github.com/abs3ntdev)! - Added Saga chain.

## 2.22.3

### Patch Changes

- [#3153](https://github.com/wevm/viem/pull/3153) [`40222c8cf984db387251e1df5922e4b9715e2bf9`](https://github.com/wevm/viem/commit/40222c8cf984db387251e1df5922e4b9715e2bf9) Thanks [@0xrouss](https://github.com/0xrouss)! - Fixed premature nonce increment by rearranging gas estimation logic.

- [`535fdf02cdefb7d705f04dda0c4b51b3d31c0bfb`](https://github.com/wevm/viem/commit/535fdf02cdefb7d705f04dda0c4b51b3d31c0bfb) Thanks [@jxom](https://github.com/jxom)! - Fixed experimental entrypoints.

- [#3189](https://github.com/wevm/viem/pull/3189) [`d5669075680a78f553c12c6556f6bccffaec8d6c`](https://github.com/wevm/viem/commit/d5669075680a78f553c12c6556f6bccffaec8d6c) Thanks [@dnzdlklc](https://github.com/dnzdlklc)! - Added Lumia Mainnet and Testnet

- [#3187](https://github.com/wevm/viem/pull/3187) [`d555ad9304f97bdcf9d1ac3cef9e86ab9a25da80`](https://github.com/wevm/viem/commit/d555ad9304f97bdcf9d1ac3cef9e86ab9a25da80) Thanks [@MaryBecky](https://github.com/MaryBecky)! - Fixed initVerseGenesis RPC URL.

## 2.22.2

### Patch Changes

- [#3178](https://github.com/wevm/viem/pull/3178) [`daad891fc6bbd84c8fe0e9320260e729ea2d8136`](https://github.com/wevm/viem/commit/daad891fc6bbd84c8fe0e9320260e729ea2d8136) Thanks [@hello-jdj](https://github.com/hello-jdj)! - Added Rivalz network.

- [#3177](https://github.com/wevm/viem/pull/3177) [`7546dfbec9268b21fe37e35d081f1cf5f88d6acc`](https://github.com/wevm/viem/commit/7546dfbec9268b21fe37e35d081f1cf5f88d6acc) Thanks [@maxandron](https://github.com/maxandron)! - Added opstack config to blast chain

- [`e12d4a0a6b26d182ab97346669c92148c13357e7`](https://github.com/wevm/viem/commit/e12d4a0a6b26d182ab97346669c92148c13357e7) Thanks [@MOZGIII](https://github.com/MOZGIII)! - Added Humanode mainnet and Testnet 5 chains.

## 2.22.1

### Patch Changes

- [`8cd4642ce140de0dabf09a7ac63b1cb15232bb39`](https://github.com/wevm/viem/commit/8cd4642ce140de0dabf09a7ac63b1cb15232bb39) Thanks [@jxom](https://github.com/jxom)! - **Experimental(ERC-7821):** Updated generic ordering on `execute`.

## 2.22.0

### Minor Changes

- [#3172](https://github.com/wevm/viem/pull/3172) [`853e49e7d235785d8066f757911411f194dc1c47`](https://github.com/wevm/viem/commit/853e49e7d235785d8066f757911411f194dc1c47) Thanks [@jxom](https://github.com/jxom)! - Added `simulate` Action (`eth_simulateV1`).

### Patch Changes

- [`f19ceef5cd455a31629d33d9a649881e76a502be`](https://github.com/wevm/viem/commit/f19ceef5cd455a31629d33d9a649881e76a502be) Thanks [@jxom](https://github.com/jxom)! - Updated public mainnet RPC URL.

## 2.21.60

### Patch Changes

- [`b0592175ecc1dae8523f708e0b0d405445a9bfa6`](https://github.com/wevm/viem/commit/b0592175ecc1dae8523f708e0b0d405445a9bfa6) Thanks [@jxom](https://github.com/jxom)! - Added `createAccessList` action.

## 2.21.59

### Patch Changes

- [#3162](https://github.com/wevm/viem/pull/3162) [`c35a01b0ddcb7106badc3892a512a96ad83d67ec`](https://github.com/wevm/viem/commit/c35a01b0ddcb7106badc3892a512a96ad83d67ec) Thanks [@danijelTxFusion](https://github.com/danijelTxFusion)! - **ZKSync:** Provided deployment of accounts and contracts using `create2`.

- [#3133](https://github.com/wevm/viem/pull/3133) [`cbf387556d4f9a913656e95829c4b6e84815de06`](https://github.com/wevm/viem/commit/cbf387556d4f9a913656e95829c4b6e84815de06) Thanks [@danijelTxFusion](https://github.com/danijelTxFusion)! - **ZKSync:** Added `getL1TokenAddress` and `getL2TokenAddress` public actions.

- [#3109](https://github.com/wevm/viem/pull/3109) [`e03f948f61ac30831c8bbce7d511bfdf1b482892`](https://github.com/wevm/viem/commit/e03f948f61ac30831c8bbce7d511bfdf1b482892) Thanks [@danijelTxFusion](https://github.com/danijelTxFusion)! - **ZKSync:** Fixed account hoisting for `signEip712Transaction` and `sendEip712Transaction`.

- [#3169](https://github.com/wevm/viem/pull/3169) [`0acee2b8d4a8c7b33e5736e2e46e1b47bb280ad6`](https://github.com/wevm/viem/commit/0acee2b8d4a8c7b33e5736e2e46e1b47bb280ad6) Thanks [@jxom](https://github.com/jxom)! - **Experimental:** Added experimental ERC-7821 actions.

## 2.21.58

### Patch Changes

- [#3160](https://github.com/wevm/viem/pull/3160) [`ffe0e95aa33ce9a69675bdbe307c5aa8a4ea7cf1`](https://github.com/wevm/viem/commit/ffe0e95aa33ce9a69675bdbe307c5aa8a4ea7cf1) Thanks [@elpiarthera](https://github.com/elpiarthera)! - Added Arthera chain.

- [`77e4685232b59e1e2c041d11de64262a9c165b1f`](https://github.com/wevm/viem/commit/77e4685232b59e1e2c041d11de64262a9c165b1f) Thanks [@jxom](https://github.com/jxom)! - **Account Abstraction:** Fixed propagation of `revertData`.

- [`7148e47e34391c8a669c5f4fce363fb0fa66067e`](https://github.com/wevm/viem/commit/7148e47e34391c8a669c5f4fce363fb0fa66067e) Thanks [@jxom](https://github.com/jxom)! - **Experimental (ERC-7739):** Added `salt` as a mandatory field of `verifierDomain`.

## 2.21.57

### Patch Changes

- [`ca0e9564d78ae8a6e936f638aaa89e1b32d957df`](https://github.com/wevm/viem/commit/ca0e9564d78ae8a6e936f638aaa89e1b32d957df) Thanks [@jxom](https://github.com/jxom)! - **Account Abstraction:** Exposed `data` on `ExecutionRevertedError`.

- [#3145](https://github.com/wevm/viem/pull/3145) [`569a325c2e56c39eb9397d4c4238161fb2f7fadf`](https://github.com/wevm/viem/commit/569a325c2e56c39eb9397d4c4238161fb2f7fadf) Thanks [@mialbu](https://github.com/mialbu)! - Added Neo X Mainnet.

- [#3146](https://github.com/wevm/viem/pull/3146) [`cf45bf183ac3fba36d9e56a8f2dd3674dec20e6b`](https://github.com/wevm/viem/commit/cf45bf183ac3fba36d9e56a8f2dd3674dec20e6b) Thanks [@mialbu](https://github.com/mialbu)! - Added Neo X T4.

- [#3150](https://github.com/wevm/viem/pull/3150) [`04630fd168ca94103a543842d36ba0127f962aaa`](https://github.com/wevm/viem/commit/04630fd168ca94103a543842d36ba0127f962aaa) Thanks [@pxrl](https://github.com/pxrl)! - Added Aleph Zero chain.

## 2.21.56

### Patch Changes

- [#3131](https://github.com/wevm/viem/pull/3131) [`aca3e1d75d979aa50f5737a2fabaf0088b160f46`](https://github.com/wevm/viem/commit/aca3e1d75d979aa50f5737a2fabaf0088b160f46) Thanks [@gmbronco](https://github.com/gmbronco)! - Added multicall3 contract to Sonic.

- [#3120](https://github.com/wevm/viem/pull/3120) [`d7b13cb1d242dbd6ae5affa3a6c68c504fa96eab`](https://github.com/wevm/viem/commit/d7b13cb1d242dbd6ae5affa3a6c68c504fa96eab) Thanks [@sajanrajdev](https://github.com/sajanrajdev)! - Updated Corn Name

- [#3134](https://github.com/wevm/viem/pull/3134) [`69919000a1ad33e070e83b3b27f032cfced0c444`](https://github.com/wevm/viem/commit/69919000a1ad33e070e83b3b27f032cfced0c444) Thanks [@NORAVemp](https://github.com/NORAVemp)! - Added InitVerseGenesis Test Chain

- [#3141](https://github.com/wevm/viem/pull/3141) [`94b4ebeb461deb2d991180903996c15b4e83d44d`](https://github.com/wevm/viem/commit/94b4ebeb461deb2d991180903996c15b4e83d44d) Thanks [@thINKoor](https://github.com/thINKoor)! - Added Ink chain.

- [#3144](https://github.com/wevm/viem/pull/3144) [`26dbca015c5c107b73e69a43b3ee9fc785b17fcf`](https://github.com/wevm/viem/commit/26dbca015c5c107b73e69a43b3ee9fc785b17fcf) Thanks [@Phillip-Kemper](https://github.com/Phillip-Kemper)! - Added OP Stack contract addresses to Zircuit and Zircuit Testnet.

- [#3139](https://github.com/wevm/viem/pull/3139) [`3271dd1e1b0cb5f0cd9c757eaeafdbd6c041d1cb`](https://github.com/wevm/viem/commit/3271dd1e1b0cb5f0cd9c757eaeafdbd6c041d1cb) Thanks [@jribbink](https://github.com/jribbink)! - Updated Flow EVM chains.

- [`43ce543850de02c18fba4aede820e943c609dcbd`](https://github.com/wevm/viem/commit/43ce543850de02c18fba4aede820e943c609dcbd) Thanks [@jxom](https://github.com/jxom)! - Added multicall addresses to Plume.

## 2.21.55

### Patch Changes

- [#3116](https://github.com/wevm/viem/pull/3116) [`45d34bbe2a5cd6f56aa5a78856ed141020eb40e1`](https://github.com/wevm/viem/commit/45d34bbe2a5cd6f56aa5a78856ed141020eb40e1) Thanks [@RealWooblay](https://github.com/RealWooblay)! - Added XR One chain.

- [#3103](https://github.com/wevm/viem/pull/3103) [`42fbfca0056466ef789a0689a4bebe17b60d2aa4`](https://github.com/wevm/viem/commit/42fbfca0056466ef789a0689a4bebe17b60d2aa4) Thanks [@iamacook](https://github.com/iamacook)! - Exported `hashStruct`.

- [#3098](https://github.com/wevm/viem/pull/3098) [`f960498b3ef2cfe39dc566ff539aab81a4608227`](https://github.com/wevm/viem/commit/f960498b3ef2cfe39dc566ff539aab81a4608227) Thanks [@hello-jdj](https://github.com/hello-jdj)! - Added Daily Network Testnet.

- [#3099](https://github.com/wevm/viem/pull/3099) [`a8865d589e7919ebe3da99ae09831435f5c24e8f`](https://github.com/wevm/viem/commit/a8865d589e7919ebe3da99ae09831435f5c24e8f) Thanks [@hello-jdj](https://github.com/hello-jdj)! - Added Daily Network Mainnet.

- [#3115](https://github.com/wevm/viem/pull/3115) [`a94862267239bb0a9ad98fe641a29f8628b6315c`](https://github.com/wevm/viem/commit/a94862267239bb0a9ad98fe641a29f8628b6315c) Thanks [@rkalis](https://github.com/rkalis)! - Added `dataSuffix` parameter to `estimateContractGas`.

- [#3110](https://github.com/wevm/viem/pull/3110) [`915c6c2b610f5e8a3f47a91d4b99e0a31306b1e0`](https://github.com/wevm/viem/commit/915c6c2b610f5e8a3f47a91d4b99e0a31306b1e0) Thanks [@karelvuong](https://github.com/karelvuong)! - Added `treasure` Mainnet and `treasureTopaz` Testnet.

- [#3119](https://github.com/wevm/viem/pull/3119) [`ee61159027b73d521e1dd357acbae43e8187fe40`](https://github.com/wevm/viem/commit/ee61159027b73d521e1dd357acbae43e8187fe40) Thanks [@0xNikolas](https://github.com/0xNikolas)! - Add Superseed Sepolia Testnet

- [#3113](https://github.com/wevm/viem/pull/3113) [`a686dcd8bb5b05b17a3f2486a2beabceeec7bc8c`](https://github.com/wevm/viem/commit/a686dcd8bb5b05b17a3f2486a2beabceeec7bc8c) Thanks [@abbas9344](https://github.com/abbas9344)! - Added multicall3 contract to Sanko.

- [`5992d93764abb913e65da3647ac75573f9e9c976`](https://github.com/wevm/viem/commit/5992d93764abb913e65da3647ac75573f9e9c976) Thanks [@jxom](https://github.com/jxom)! - Added Plume Mainnet & Testnet.

- [#3108](https://github.com/wevm/viem/pull/3108) [`fb9d29267b8f1a9d30b13dce1581504282ffaee6`](https://github.com/wevm/viem/commit/fb9d29267b8f1a9d30b13dce1581504282ffaee6) Thanks [@defiboyszn](https://github.com/defiboyszn)! - Added Creator testnet.

- [#3119](https://github.com/wevm/viem/pull/3119) [`ee61159027b73d521e1dd357acbae43e8187fe40`](https://github.com/wevm/viem/commit/ee61159027b73d521e1dd357acbae43e8187fe40) Thanks [@0xNikolas](https://github.com/0xNikolas)! - Add Superseed Mainnet

- [#3111](https://github.com/wevm/viem/pull/3111) [`83ae3e15d2baaaf96c784d7f9020abcb274c5245`](https://github.com/wevm/viem/commit/83ae3e15d2baaaf96c784d7f9020abcb274c5245) Thanks [@hello-jdj](https://github.com/hello-jdj)! - Added Mitosis Testnet.

- [#3107](https://github.com/wevm/viem/pull/3107) [`f8c002fe7052fce747b3374dda4d15cbfce6a5c4`](https://github.com/wevm/viem/commit/f8c002fe7052fce747b3374dda4d15cbfce6a5c4) Thanks [@pk-850](https://github.com/pk-850)! - Added Sonic mainnet.

- [#3096](https://github.com/wevm/viem/pull/3096) [`092615f58a19994b6ba01dfb30b9ba0f6ad2902b`](https://github.com/wevm/viem/commit/092615f58a19994b6ba01dfb30b9ba0f6ad2902b) Thanks [@jxom](https://github.com/jxom)! - **Experimental:** Synced ERC-7739 extension to latest spec.

## 2.21.54

### Patch Changes

- [#3081](https://github.com/wevm/viem/pull/3081) [`0d9dfcd1d22d82e995abc4a23fb86614244faa54`](https://github.com/wevm/viem/commit/0d9dfcd1d22d82e995abc4a23fb86614244faa54) Thanks [@danijelTxFusion](https://github.com/danijelTxFusion)! - Added ZKSync local hyperchain networks.

- [`7c0cce92b904f1771ec9747e7aa6a6482159a87b`](https://github.com/wevm/viem/commit/7c0cce92b904f1771ec9747e7aa6a6482159a87b) Thanks [@jxom](https://github.com/jxom)! - Added assertion for ABI-encoding integer ranges.

- [#3093](https://github.com/wevm/viem/pull/3093) [`8b70d75b9d81c5eae05e81cb3bf158a25ae4c617`](https://github.com/wevm/viem/commit/8b70d75b9d81c5eae05e81cb3bf158a25ae4c617) Thanks [@pk-850](https://github.com/pk-850)! - Added ADF Chain.

- [#3095](https://github.com/wevm/viem/pull/3095) [`1d2ae845faadae36a0c25963449bbadc1ff65815`](https://github.com/wevm/viem/commit/1d2ae845faadae36a0c25963449bbadc1ff65815) Thanks [@timothyshen](https://github.com/timothyshen)! - Added Story Odyssey Testnet.

- [#2642](https://github.com/wevm/viem/pull/2642) [`d1d092c19326fe0045233aee0cde8f6ceaff8633`](https://github.com/wevm/viem/commit/d1d092c19326fe0045233aee0cde8f6ceaff8633) Thanks [@0x33dm](https://github.com/0x33dm)! - Added `ping` option to `fallback` Transport.

- [#3089](https://github.com/wevm/viem/pull/3089) [`699c854c1250977c2a6209233685a506df9bcd9b`](https://github.com/wevm/viem/commit/699c854c1250977c2a6209233685a506df9bcd9b) Thanks [@plusminushalf](https://github.com/plusminushalf)! - Added `id` to `WebAuthnAccount`.

- [#3085](https://github.com/wevm/viem/pull/3085) [`acc496adc8d419ce6c593408ee75925c05fb22b6`](https://github.com/wevm/viem/commit/acc496adc8d419ce6c593408ee75925c05fb22b6) Thanks [@Zhangnong](https://github.com/Zhangnong)! - Added multicall3 contract to ThunderCore.

- [`feecb7841145e4a92a1968625a832ccfec68a3d7`](https://github.com/wevm/viem/commit/feecb7841145e4a92a1968625a832ccfec68a3d7) Thanks [@jxom](https://github.com/jxom)! - Updated dependencies.

## 2.21.53

### Patch Changes

- [#3076](https://github.com/wevm/viem/pull/3076) [`6102935c4cea8b39778b8824425ccf00f7377dd8`](https://github.com/wevm/viem/commit/6102935c4cea8b39778b8824425ccf00f7377dd8) Thanks [@ezynda3](https://github.com/ezynda3)! - Updated ApeScan API URL.

- [#3074](https://github.com/wevm/viem/pull/3074) [`9de4385bc84af48efac38e387716ebe2cdbb2cf8`](https://github.com/wevm/viem/commit/9de4385bc84af48efac38e387716ebe2cdbb2cf8) Thanks [@Zhangnong](https://github.com/Zhangnong)! - Added Multicall address to Fluence.

## 2.21.52

### Patch Changes

- [#3070](https://github.com/wevm/viem/pull/3070) [`6edad0263d82b11342dd3a913f97f630b5cc813d`](https://github.com/wevm/viem/commit/6edad0263d82b11342dd3a913f97f630b5cc813d) Thanks [@sherrys808](https://github.com/sherrys808)! - Added Redbelly Mainnet Chain.

- [#3072](https://github.com/wevm/viem/pull/3072) [`c2beb14c4574cab901cc7bda53bd166c444b27fb`](https://github.com/wevm/viem/commit/c2beb14c4574cab901cc7bda53bd166c444b27fb) Thanks [@sajanrajdev](https://github.com/sajanrajdev)! - Added Corn Testnet.

- [#3068](https://github.com/wevm/viem/pull/3068) [`c5768003785321628351b02156abe18291c9186c`](https://github.com/wevm/viem/commit/c5768003785321628351b02156abe18291c9186c) Thanks [@nfmelendez](https://github.com/nfmelendez)! - Fixed `waitForTransactionReceipt` race condition when polling many blocks

- [#3071](https://github.com/wevm/viem/pull/3071) [`29fc49301f6b2adeccb79ed7a69b3e59bac55278`](https://github.com/wevm/viem/commit/29fc49301f6b2adeccb79ed7a69b3e59bac55278) Thanks [@sajanrajdev](https://github.com/sajanrajdev)! - Added Corn Maizenet.

## 2.21.51

### Patch Changes

- [#3056](https://github.com/wevm/viem/pull/3056) [`dffc56114cbc6f0d5bcf8287dd109e0d3244ca81`](https://github.com/wevm/viem/commit/dffc56114cbc6f0d5bcf8287dd109e0d3244ca81) Thanks [@stonega](https://github.com/stonega)! - Added Bool Beta Mainnet.

- [#3062](https://github.com/wevm/viem/pull/3062) [`5ab60e37617e6296e93319f6ffda4b0783d1a853`](https://github.com/wevm/viem/commit/5ab60e37617e6296e93319f6ffda4b0783d1a853) Thanks [@jxom](https://github.com/jxom)! - **Experimental (EIP-7702):** Added `prepareAuthorization`.

- [`2498543a3f165517ae649010a1cb439ff9267637`](https://github.com/wevm/viem/commit/2498543a3f165517ae649010a1cb439ff9267637) Thanks [@jxom](https://github.com/jxom)! - Added Sonic Testnet.

- [#3055](https://github.com/wevm/viem/pull/3055) [`a39c279af93faaa4b1afd61581b811aaa1da7456`](https://github.com/wevm/viem/commit/a39c279af93faaa4b1afd61581b811aaa1da7456) Thanks [@qi-0826](https://github.com/qi-0826)! - Added WorldLand Mainnet.

- [#3053](https://github.com/wevm/viem/pull/3053) [`e135e9fd966fce6791a6eee1e59fe7bdae7be73b`](https://github.com/wevm/viem/commit/e135e9fd966fce6791a6eee1e59fe7bdae7be73b) Thanks [@qi-0826](https://github.com/qi-0826)! - Added SwissDLT Mainnet.

## 2.21.50

### Patch Changes

- [#3045](https://github.com/wevm/viem/pull/3045) [`dd0ae9cd98024f45f7afb2f4bf0c434ce3b2bb09`](https://github.com/wevm/viem/commit/dd0ae9cd98024f45f7afb2f4bf0c434ce3b2bb09) Thanks [@Zhangnong](https://github.com/Zhangnong)! - Added REI Mainnet.

- [#3048](https://github.com/wevm/viem/pull/3048) [`a66b43df8b93b960b3ca60c5477ea2785702a2a9`](https://github.com/wevm/viem/commit/a66b43df8b93b960b3ca60c5477ea2785702a2a9) Thanks [@Zhangnong](https://github.com/Zhangnong)! - Added Planq Mainnet.

- [`d98795c45cbc20bf6525001bd7d73d90e5352645`](https://github.com/wevm/viem/commit/d98795c45cbc20bf6525001bd7d73d90e5352645) Thanks [@jxom](https://github.com/jxom)! - Added 5ireChain.

- [#3050](https://github.com/wevm/viem/pull/3050) [`ac24ad93a42430ad364fa7cfaed2e3a59fb0600d`](https://github.com/wevm/viem/commit/ac24ad93a42430ad364fa7cfaed2e3a59fb0600d) Thanks [@pk-850](https://github.com/pk-850)! - Added Multicall address to Velas EVM Mainnet.

## 2.21.49

### Patch Changes

- [#3004](https://github.com/wevm/viem/pull/3004) [`0c98d991b5ec6990251486d860349718f8e7ea04`](https://github.com/wevm/viem/commit/0c98d991b5ec6990251486d860349718f8e7ea04) Thanks [@atarpara](https://github.com/atarpara)! - **ZKsync:** Fixed `TransactionReceipt` formatter & type.

- [`c4ba3cf8145dd0e6b4f9e14f2b414063fbeeefe0`](https://github.com/wevm/viem/commit/c4ba3cf8145dd0e6b4f9e14f2b414063fbeeefe0) Thanks [@jxom](https://github.com/jxom)! - Added ability to set a nullish `account` on `simulateContract`.

- [#3034](https://github.com/wevm/viem/pull/3034) [`9c1db8933ce6dab1e9dde4c7159f7cb582a78a2d`](https://github.com/wevm/viem/commit/9c1db8933ce6dab1e9dde4c7159f7cb582a78a2d) Thanks [@qi-0826](https://github.com/qi-0826)! - Added Metadium Network.

- [#3033](https://github.com/wevm/viem/pull/3033) [`817023fe2de3edeff30e9454410d4ba346594e7e`](https://github.com/wevm/viem/commit/817023fe2de3edeff30e9454410d4ba346594e7e) Thanks [@qi-0826](https://github.com/qi-0826)! - Added Six Protocol.

- [`459e444a1061a264568904db8a26398bc8d4ecf5`](https://github.com/wevm/viem/commit/459e444a1061a264568904db8a26398bc8d4ecf5) Thanks [@jxom](https://github.com/jxom)! - Added `setSignEntropy` export to improve security of signature generation.

- [#3038](https://github.com/wevm/viem/pull/3038) [`349143282c9cbd21abe0b07b05b7f78c699d8672`](https://github.com/wevm/viem/commit/349143282c9cbd21abe0b07b05b7f78c699d8672) Thanks [@isabelle817](https://github.com/isabelle817)! - Added DisChain.

- [#3035](https://github.com/wevm/viem/pull/3035) [`a598b5a80167609ca0b1f6597fe6ca9fd0ca47fe`](https://github.com/wevm/viem/commit/a598b5a80167609ca0b1f6597fe6ca9fd0ca47fe) Thanks [@SilverPokerKing](https://github.com/SilverPokerKing)! - Added Multicall address to Bitgert.

- [#3040](https://github.com/wevm/viem/pull/3040) [`649cd921090b2273b90fa2aa4226732e501eb3a3`](https://github.com/wevm/viem/commit/649cd921090b2273b90fa2aa4226732e501eb3a3) Thanks [@Kharabet](https://github.com/Kharabet)! - Added Guru Network.

- [#3039](https://github.com/wevm/viem/pull/3039) [`f016b161d078c2de36d5b8fd5b6788ef5773e543`](https://github.com/wevm/viem/commit/f016b161d078c2de36d5b8fd5b6788ef5773e543) Thanks [@isabelle817](https://github.com/isabelle817)! - Added iSunCoin Mainnet.

## 2.21.48

### Patch Changes

- [#3018](https://github.com/wevm/viem/pull/3018) [`42ea1134c82fcdd95d3c0a3766276eba1a01eb72`](https://github.com/wevm/viem/commit/42ea1134c82fcdd95d3c0a3766276eba1a01eb72) Thanks [@pk-850](https://github.com/pk-850)! - Added energy chain.

- [#2948](https://github.com/wevm/viem/pull/2948) [`dbd72a4eab890903216e085dd52d2438e20aa1fc`](https://github.com/wevm/viem/commit/dbd72a4eab890903216e085dd52d2438e20aa1fc) Thanks [@nikola-bozin-txfusion](https://github.com/nikola-bozin-txfusion)! - Added `parseEip712Transaction` util function in ZKsync extension.

- [#3017](https://github.com/wevm/viem/pull/3017) [`b4a05d6b51baea81fcde4c58b5ec814fd19a2630`](https://github.com/wevm/viem/commit/b4a05d6b51baea81fcde4c58b5ec814fd19a2630) Thanks [@SakuraCase](https://github.com/SakuraCase)! - Added MCH Verse chain.

- [#3019](https://github.com/wevm/viem/pull/3019) [`465389324bf1a3422ddc02491fe3f0efc1a52281`](https://github.com/wevm/viem/commit/465389324bf1a3422ddc02491fe3f0efc1a52281) Thanks [@pk-850](https://github.com/pk-850)! - Added Vanar Mainnet.

## 2.21.47

### Patch Changes

- [#3009](https://github.com/wevm/viem/pull/3009) [`b57213a76771f4172781d67595c99a9599ea54ea`](https://github.com/wevm/viem/commit/b57213a76771f4172781d67595c99a9599ea54ea) Thanks [@vijaypushkin](https://github.com/vijaypushkin)! - Resolved type error by explicitly typing `headers` as `HeadersInit` in CCIP.

- [#3010](https://github.com/wevm/viem/pull/3010) [`c5ba0283d02f8e584b7a291695753b32b1874fc8`](https://github.com/wevm/viem/commit/c5ba0283d02f8e584b7a291695753b32b1874fc8) Thanks [@andychert](https://github.com/andychert)! - Added Multicall address to Taiko Hekla chain.

- [#3013](https://github.com/wevm/viem/pull/3013) [`70994fa73f96d2f5e6ce7e7c08cc1f360888e576`](https://github.com/wevm/viem/commit/70994fa73f96d2f5e6ce7e7c08cc1f360888e576) Thanks [@Zhangnong](https://github.com/Zhangnong)! - Added One World Chain Mainnet.

- [#3014](https://github.com/wevm/viem/pull/3014) [`32315c2336959135786fcf0b899ce19e0bf450a1`](https://github.com/wevm/viem/commit/32315c2336959135786fcf0b899ce19e0bf450a1) Thanks [@qi-0826](https://github.com/qi-0826)! - Added Multicall address to Superposition.

- [#3012](https://github.com/wevm/viem/pull/3012) [`bc7f4ae22bfec4305412c65a6ac57b918a225dfb`](https://github.com/wevm/viem/commit/bc7f4ae22bfec4305412c65a6ac57b918a225dfb) Thanks [@Zhangnong](https://github.com/Zhangnong)! - Added Omax Mainnet.

## 2.21.46

### Patch Changes

- [#3007](https://github.com/wevm/viem/pull/3007) [`87024db3b5c06a68d16cfbdf5abe93132103c53c`](https://github.com/wevm/viem/commit/87024db3b5c06a68d16cfbdf5abe93132103c53c) Thanks [@fengbaolong](https://github.com/fengbaolong)! - Added Coinbit Mainnet.

- [#3006](https://github.com/wevm/viem/pull/3006) [`f2a0c05b7b6b86d3e19dcc2a433ba102e217f9f6`](https://github.com/wevm/viem/commit/f2a0c05b7b6b86d3e19dcc2a433ba102e217f9f6) Thanks [@fengbaolong](https://github.com/fengbaolong)! - Added ABEY Mainnet.

## 2.21.45

### Patch Changes

- [#2997](https://github.com/wevm/viem/pull/2997) [`764a3ec32add8bb4958236fc4ecb638bc397916a`](https://github.com/wevm/viem/commit/764a3ec32add8bb4958236fc4ecb638bc397916a) Thanks [@qi-0826](https://github.com/qi-0826)! - Added Expanse Network.

- [#3000](https://github.com/wevm/viem/pull/3000) [`fd9ae520a53a5a0ff1ade0309c4d547280ce5fdc`](https://github.com/wevm/viem/commit/fd9ae520a53a5a0ff1ade0309c4d547280ce5fdc) Thanks [@0xtomm](https://github.com/0xtomm)! - Fixed Gnosis native currency.

- [#3002](https://github.com/wevm/viem/pull/3002) [`629db3830829e7f29e4fa9c1c9861b0435045437`](https://github.com/wevm/viem/commit/629db3830829e7f29e4fa9c1c9861b0435045437) Thanks [@pk-850](https://github.com/pk-850)! - Added High Performance Blockchain.

- [#2992](https://github.com/wevm/viem/pull/2992) [`49f7e0866b98af21d08d28a17e6d06f44b00790f`](https://github.com/wevm/viem/commit/49f7e0866b98af21d08d28a17e6d06f44b00790f) Thanks [@Zhangnong](https://github.com/Zhangnong)! - Added Bitgert Mainnet.

- [#2991](https://github.com/wevm/viem/pull/2991) [`0e36ce17c9a592f1fb269b14a967e11d8af66626`](https://github.com/wevm/viem/commit/0e36ce17c9a592f1fb269b14a967e11d8af66626) Thanks [@Zhangnong](https://github.com/Zhangnong)! - Added Nahmii 2 Mainnet.

- [#2998](https://github.com/wevm/viem/pull/2998) [`139c5a27b757c3550d360eba8123bbf80d745ba7`](https://github.com/wevm/viem/commit/139c5a27b757c3550d360eba8123bbf80d745ba7) Thanks [@qi-0826](https://github.com/qi-0826)! - Added IDChain Mainnet.

- [#2994](https://github.com/wevm/viem/pull/2994) [`82633bda23780791fd5b70aa0a6d3bf7e250955a`](https://github.com/wevm/viem/commit/82633bda23780791fd5b70aa0a6d3bf7e250955a) Thanks [@cinnabarhorse](https://github.com/cinnabarhorse)! - Added Polter Testnet and Geist Mainnet

- [`dbf13c0362b890765a7a25703d92f2b756fdbf4e`](https://github.com/wevm/viem/commit/dbf13c0362b890765a7a25703d92f2b756fdbf4e) Thanks [@jxom](https://github.com/jxom)! - Assert that EIP-712 domains are valid.

- [`162f3c23e7ffbf31bd2353b8812a0665c9359be5`](https://github.com/wevm/viem/commit/162f3c23e7ffbf31bd2353b8812a0665c9359be5) Thanks [@jxom](https://github.com/jxom)! - Fixed issue where accessing \`block.transactions\` on \`watchBlock\` (via subscription) would throw a runtime error.

## 2.21.44

### Patch Changes

- [`b5cc7a2864801181a0d4541886b4060d52f1aaf3`](https://github.com/wevm/viem/commit/b5cc7a2864801181a0d4541886b4060d52f1aaf3) Thanks [@jxom](https://github.com/jxom)! - Updated Ox to resolve #2987.

## 2.21.43

### Patch Changes

- [`dce1a72c344d68ca568fbd04f282f1d6185abd36`](https://github.com/wevm/viem/commit/dce1a72c344d68ca568fbd04f282f1d6185abd36) Thanks [@jxom](https://github.com/jxom)! - Updated \`normalize\` to use \`ox/Ens\`.

- [`af1fe2d1c68baa321d1163deff06d26ee3f5a313`](https://github.com/wevm/viem/commit/af1fe2d1c68baa321d1163deff06d26ee3f5a313) Thanks [@jxom](https://github.com/jxom)! - Fixed inference for overloaded functions on \`readContract\` + \`simulateContract\` Actions.

- [#2982](https://github.com/wevm/viem/pull/2982) [`7d9ec2e98e5200e6fcc7911054fd022b25e85a93`](https://github.com/wevm/viem/commit/7d9ec2e98e5200e6fcc7911054fd022b25e85a93) Thanks [@pk-850](https://github.com/pk-850)! - Added CoinEx Mainnet.

- [#2983](https://github.com/wevm/viem/pull/2983) [`1a3e090d341c0f2e6b19da0090e6ca05b127b2ed`](https://github.com/wevm/viem/commit/1a3e090d341c0f2e6b19da0090e6ca05b127b2ed) Thanks [@pk-850](https://github.com/pk-850)! - Added Ubiq Mainnet.

- [#2984](https://github.com/wevm/viem/pull/2984) [`907c646076f19d6de8040c800a8d6c45596d7a97`](https://github.com/wevm/viem/commit/907c646076f19d6de8040c800a8d6c45596d7a97) Thanks [@vince0656](https://github.com/vince0656)! - Added Mekong chain.

## 2.21.42

### Patch Changes

- [#2976](https://github.com/wevm/viem/pull/2976) [`8acccb16d7acb0d8367b7c85ca496aa6c9582c67`](https://github.com/wevm/viem/commit/8acccb16d7acb0d8367b7c85ca496aa6c9582c67) Thanks [@vittominacori](https://github.com/vittominacori)! - Fixed Unichain block explorer API URL.

- [#2972](https://github.com/wevm/viem/pull/2972) [`a25864b336dbca800a8f5e598dd8b808194245e3`](https://github.com/wevm/viem/commit/a25864b336dbca800a8f5e598dd8b808194245e3) Thanks [@qi-0826](https://github.com/qi-0826)! - Added Diode Prenet.

- [#2970](https://github.com/wevm/viem/pull/2970) [`fd3547bb4d4477aef09d94e38a53e6e399af551d`](https://github.com/wevm/viem/commit/fd3547bb4d4477aef09d94e38a53e6e399af551d) Thanks [@qi-0826](https://github.com/qi-0826)! - Added Acria IntelliChain.

## 2.21.41

### Patch Changes

- [#2962](https://github.com/wevm/viem/pull/2962) [`de25e2b617b2a01bb9daf23cc3de927438fdc15c`](https://github.com/wevm/viem/commit/de25e2b617b2a01bb9daf23cc3de927438fdc15c) Thanks [@Zhangnong](https://github.com/Zhangnong)! - Added ENULS Mainnet.

- [#2963](https://github.com/wevm/viem/pull/2963) [`83869dabffcaab99e401ddc35fa9e2781a15bf59`](https://github.com/wevm/viem/commit/83869dabffcaab99e401ddc35fa9e2781a15bf59) Thanks [@Zhangnong](https://github.com/Zhangnong)! - Added AIOZ Network.

- [#2965](https://github.com/wevm/viem/pull/2965) [`eb1863277483106b55b8fa74716f52a9e642b3d0`](https://github.com/wevm/viem/commit/eb1863277483106b55b8fa74716f52a9e642b3d0) Thanks [@alcuadrado](https://github.com/alcuadrado)! - Fixed `sendTransaction` error bubbling for fallback.

- [#2968](https://github.com/wevm/viem/pull/2968) [`e8a79e8eb94b405e02ea05735bb6e6f204623a51`](https://github.com/wevm/viem/commit/e8a79e8eb94b405e02ea05735bb6e6f204623a51) Thanks [@roylines](https://github.com/roylines)! - Update from MATIC to POL on Polygon Amoy.

- [#2965](https://github.com/wevm/viem/pull/2965) [`eb1863277483106b55b8fa74716f52a9e642b3d0`](https://github.com/wevm/viem/commit/eb1863277483106b55b8fa74716f52a9e642b3d0) Thanks [@alcuadrado](https://github.com/alcuadrado)! - Rethrow the original `eth_sendTransaction` error if `wallet_sendTransaction` isn't supported

- [#2964](https://github.com/wevm/viem/pull/2964) [`4c688448928ed998b2884bcda5c3885af43750d6`](https://github.com/wevm/viem/commit/4c688448928ed998b2884bcda5c3885af43750d6) Thanks [@impelcrypto](https://github.com/impelcrypto)! - Updated the disputeGameFactory contract and the explorer URL for Soneium Minato

## 2.21.40

### Patch Changes

- [#2954](https://github.com/wevm/viem/pull/2954) [`4f931a525b50b33ea9c5c878cf23c5a72d69db59`](https://github.com/wevm/viem/commit/4f931a525b50b33ea9c5c878cf23c5a72d69db59) Thanks [@alcuadrado](https://github.com/alcuadrado)! - Make `BaseError#walk` tolerant to an `undefined` cause.

- [#2956](https://github.com/wevm/viem/pull/2956) [`9f7a8f3dd65126da03102cecc9981ba398231a92`](https://github.com/wevm/viem/commit/9f7a8f3dd65126da03102cecc9981ba398231a92) Thanks [@fengbaolong](https://github.com/fengbaolong)! - Added Godwoken Mainnet.

- [#2957](https://github.com/wevm/viem/pull/2957) [`106d1ea436178268eb9524b22d12c0afb4363182`](https://github.com/wevm/viem/commit/106d1ea436178268eb9524b22d12c0afb4363182) Thanks [@fengbaolong](https://github.com/fengbaolong)! - Added zeniq chain.

## 2.21.39

### Patch Changes

- [`4de3e658d2505be4d28c4064d400409664c23096`](https://github.com/wevm/viem/commit/4de3e658d2505be4d28c4064d400409664c23096) Thanks [@SahilVasava](https://github.com/SahilVasava)! - **Account Abstraction:** Added optional param `UserOperationRequest` to `getStubSignature`

## 2.21.38

### Patch Changes

- [#2944](https://github.com/wevm/viem/pull/2944) [`a41f29ddec7cb6310ac42e069b390fe6bb14e4fa`](https://github.com/wevm/viem/commit/a41f29ddec7cb6310ac42e069b390fe6bb14e4fa) Thanks [@pro100skm](https://github.com/pro100skm)! - Updated XDC Testnet Block Explorer URL.

- [#2950](https://github.com/wevm/viem/pull/2950) [`f6a22e9e7e494319872eeab08afd72b99de2d959`](https://github.com/wevm/viem/commit/f6a22e9e7e494319872eeab08afd72b99de2d959) Thanks [@qi-0826](https://github.com/qi-0826)! - Added KardiaChain Mainnet.

- [#2949](https://github.com/wevm/viem/pull/2949) [`ca1ef339b2495c37866ce219a2fbcfd4a170611b`](https://github.com/wevm/viem/commit/ca1ef339b2495c37866ce219a2fbcfd4a170611b) Thanks [@qi-0826](https://github.com/qi-0826)! - Added Saakuru Mainnet.

- [#2896](https://github.com/wevm/viem/pull/2896) [`c0367c84f9f8c04968b413ed89eb0f18883d6b24`](https://github.com/wevm/viem/commit/c0367c84f9f8c04968b413ed89eb0f18883d6b24) Thanks [@stephancill](https://github.com/stephancill)! - Added `ownerIndex` parameter to `toCoinbaseSmartWallet`.

## 2.21.37

### Patch Changes

- [#2940](https://github.com/wevm/viem/pull/2940) [`c1ef3b7902a67aed76cac72ba469ff8c709287a6`](https://github.com/wevm/viem/commit/c1ef3b7902a67aed76cac72ba469ff8c709287a6) Thanks [@Zhangnong](https://github.com/Zhangnong)! - Added Theta chain.

- [#2941](https://github.com/wevm/viem/pull/2941) [`3bf2526a650a4208e95d4623a7bbc1d9f3fb893e`](https://github.com/wevm/viem/commit/3bf2526a650a4208e95d4623a7bbc1d9f3fb893e) Thanks [@Zhangnong](https://github.com/Zhangnong)! - Added Glide Protocol.

- [#2942](https://github.com/wevm/viem/pull/2942) [`12347cf1f91f9a7d04a619b7c2f1b202842d43f5`](https://github.com/wevm/viem/commit/12347cf1f91f9a7d04a619b7c2f1b202842d43f5) Thanks [@ink-alexander](https://github.com/ink-alexander)! - Added Ink Sepolia chain configurations

## 2.21.36

### Patch Changes

- [#2936](https://github.com/wevm/viem/pull/2936) [`bad30f7494cc5432ba4c525cfefa08e482fa5cae`](https://github.com/wevm/viem/commit/bad30f7494cc5432ba4c525cfefa08e482fa5cae) Thanks [@CaityGossland](https://github.com/CaityGossland)! - Added meld chain.

- [#2932](https://github.com/wevm/viem/pull/2932) [`86096f0e0955d0824bf23bb201ec2f3fa11db8a9`](https://github.com/wevm/viem/commit/86096f0e0955d0824bf23bb201ec2f3fa11db8a9) Thanks [@qi-0826](https://github.com/qi-0826)! - Add THAT Mainnet chain.

- [#2931](https://github.com/wevm/viem/pull/2931) [`f1ee5154b3bdfa0bb9991929023a3da3898b06dd`](https://github.com/wevm/viem/commit/f1ee5154b3bdfa0bb9991929023a3da3898b06dd) Thanks [@qi-0826](https://github.com/qi-0826)! - Added Tomb Mainnet.

## 2.21.35

### Patch Changes

- [#2923](https://github.com/wevm/viem/pull/2923) [`d887dba1e694ffdcd413a752b148f6ae05487d17`](https://github.com/wevm/viem/commit/d887dba1e694ffdcd413a752b148f6ae05487d17) Thanks [@cbfyi](https://github.com/cbfyi)! - Added Dispute Game Factory contract for Base.

- [`335f7e852bb526ea23564afacc46b5d6b74dae7a`](https://github.com/wevm/viem/commit/335f7e852bb526ea23564afacc46b5d6b74dae7a) Thanks [@jxom](https://github.com/jxom)! - Added validation for typed data `primaryType`.

- [#2925](https://github.com/wevm/viem/pull/2925) [`7fbb016204d4c310ee96bf53e631257f8f3e770e`](https://github.com/wevm/viem/commit/7fbb016204d4c310ee96bf53e631257f8f3e770e) Thanks [@0xArdy](https://github.com/0xArdy)! - Updated World Chain (Mainnet and Testnet) and Unichain Sepolia chain definitions

- [#2922](https://github.com/wevm/viem/pull/2922) [`f6339079cc075c7e069f062c18dbdd2d4306c996`](https://github.com/wevm/viem/commit/f6339079cc075c7e069f062c18dbdd2d4306c996) Thanks [@oxSaturn](https://github.com/oxSaturn)! - Added multicall3 for iota.

- [#2919](https://github.com/wevm/viem/pull/2919) [`5ff60a39c642b4715d9142a1435d14d7896be5d1`](https://github.com/wevm/viem/commit/5ff60a39c642b4715d9142a1435d14d7896be5d1) Thanks [@Zhangnong](https://github.com/Zhangnong)! - Added Velas chain.

- [#2924](https://github.com/wevm/viem/pull/2924) [`d2632d2e9eb572c5346e535d1b22eb7568a47bc1`](https://github.com/wevm/viem/commit/d2632d2e9eb572c5346e535d1b22eb7568a47bc1) Thanks [@Zhangnong](https://github.com/Zhangnong)! - Added Genesys Mainnet.

## 2.21.34

### Patch Changes

- [#2917](https://github.com/wevm/viem/pull/2917) [`b3f8199f5560fb64b2c84de75b7f8d6b30990262`](https://github.com/wevm/viem/commit/b3f8199f5560fb64b2c84de75b7f8d6b30990262) Thanks [@0xPenryn](https://github.com/0xPenryn)! - Updated World Chain (Mainnet and Sepolia)

- [`80f43544f82e8621ad71e74441b900967dfc306c`](https://github.com/wevm/viem/commit/80f43544f82e8621ad71e74441b900967dfc306c) Thanks [@jxom](https://github.com/jxom)! - Resolved timer leak in `waitForTransactionReceipt`.

- [#2915](https://github.com/wevm/viem/pull/2915) [`8032ffa98db644cb3abcd13eedbd05b41e74637f`](https://github.com/wevm/viem/commit/8032ffa98db644cb3abcd13eedbd05b41e74637f) Thanks [@iltumio](https://github.com/iltumio)! - **Linea Extension:** Fixed `estimateGas` infinite loop.

## 2.21.33

### Patch Changes

- [`d21d9d031442ddb65ea6e633029fb4f43235a27f`](https://github.com/wevm/viem/commit/d21d9d031442ddb65ea6e633029fb4f43235a27f) Thanks [@jxom](https://github.com/jxom)! - Fixed gas estimation issue for OP Stack withdrawals.

- [#2897](https://github.com/wevm/viem/pull/2897) [`40514f93c9147c26cc47f25421adcec8230d6c40`](https://github.com/wevm/viem/commit/40514f93c9147c26cc47f25421adcec8230d6c40) Thanks [@catbutter](https://github.com/catbutter)! - Added DustBoy IoT chain.

- [#2908](https://github.com/wevm/viem/pull/2908) [`903d1e4256101253e4fbd6659ae5c2180464427a`](https://github.com/wevm/viem/commit/903d1e4256101253e4fbd6659ae5c2180464427a) Thanks [@qi-0826](https://github.com/qi-0826)! - Added LAVITA Mainnet.

- [#2907](https://github.com/wevm/viem/pull/2907) [`d3047ead21b4785c83aae35e896120b1dc390ecf`](https://github.com/wevm/viem/commit/d3047ead21b4785c83aae35e896120b1dc390ecf) Thanks [@qi-0826](https://github.com/qi-0826)! - Added Bitrock Mainnet.

## 2.21.32

### Patch Changes

- [`d461c657b4f7ed8c0e255254356d8e5b2b65e173`](https://github.com/wevm/viem/commit/d461c657b4f7ed8c0e255254356d8e5b2b65e173) Thanks [@jxom](https://github.com/jxom)! - Added ability to pass a `0` chain ID to EIP-7702 Authorizations.

## 2.21.31

### Patch Changes

- [#2895](https://github.com/wevm/viem/pull/2895) [`4170a3dd5acda9ca1184e6e94f2da56ab640ea6a`](https://github.com/wevm/viem/commit/4170a3dd5acda9ca1184e6e94f2da56ab640ea6a) Thanks [@fengbaolong](https://github.com/fengbaolong)! - Added Sanko chain.

- [#2890](https://github.com/wevm/viem/pull/2890) [`8e45821d0bcd98a134dd13c0c3373280d00f3dd4`](https://github.com/wevm/viem/commit/8e45821d0bcd98a134dd13c0c3373280d00f3dd4) Thanks [@excelon-team](https://github.com/excelon-team)! - Added Excelon Mainnet chain.

- [#2893](https://github.com/wevm/viem/pull/2893) [`6219548112d60a3187031534bcb77cd0c20dd550`](https://github.com/wevm/viem/commit/6219548112d60a3187031534bcb77cd0c20dd550) Thanks [@akshatmittal](https://github.com/akshatmittal)! - Added Ape Chain.

## 2.21.30

### Patch Changes

- [#2885](https://github.com/wevm/viem/pull/2885) [`c53eb7459f4abadd6addba04ab4534e9befc8b05`](https://github.com/wevm/viem/commit/c53eb7459f4abadd6addba04ab4534e9befc8b05) Thanks [@fengbaolong](https://github.com/fengbaolong)! - Added Step Network.

- [#2883](https://github.com/wevm/viem/pull/2883) [`67e664c88b74e16b1b93894911c5453063387db3`](https://github.com/wevm/viem/commit/67e664c88b74e16b1b93894911c5453063387db3) Thanks [@realwater](https://github.com/realwater)! - Added tiktrixTestnet chain

- [#2884](https://github.com/wevm/viem/pull/2884) [`1a4c08170e2caf0c2f23208c4cc9200eab3ec54a`](https://github.com/wevm/viem/commit/1a4c08170e2caf0c2f23208c4cc9200eab3ec54a) Thanks [@fengbaolong](https://github.com/fengbaolong)! - Added ThunderCore Mainnet.

- [#2873](https://github.com/wevm/viem/pull/2873) [`ab21126152443fdad3e829135b009e871eab23ba`](https://github.com/wevm/viem/commit/ab21126152443fdad3e829135b009e871eab23ba) Thanks [@nicholaspai](https://github.com/nicholaspai)! - **OP Stack:** Added `logIndex` as a parameter to `getWithdrawalStatus`.

- [`c2cd08162b81c64f4fc5812d4f4f863408eb4afa`](https://github.com/wevm/viem/commit/c2cd08162b81c64f4fc5812d4f4f863408eb4afa) Thanks [@jxom](https://github.com/jxom)! - Added validation to typed data type references.

## 2.21.29

### Patch Changes

- [#2876](https://github.com/wevm/viem/pull/2876) [`3759bee5c0df3e90f9e2a9cc89da707502370dbd`](https://github.com/wevm/viem/commit/3759bee5c0df3e90f9e2a9cc89da707502370dbd) Thanks [@m1guelpf](https://github.com/m1guelpf)! - Added `Content-Type` header to CCIP `POST` requests.

- [#2878](https://github.com/wevm/viem/pull/2878) [`58a0f1b0ddefbb117fceaf6e7939c026d84aa108`](https://github.com/wevm/viem/commit/58a0f1b0ddefbb117fceaf6e7939c026d84aa108) Thanks [@Zhangnong](https://github.com/Zhangnong)! - Added Bifrost Mainnet.

- [#2879](https://github.com/wevm/viem/pull/2879) [`8b34dd7563d771de249edfe7ec536254039b0808`](https://github.com/wevm/viem/commit/8b34dd7563d771de249edfe7ec536254039b0808) Thanks [@lwin-kyaw](https://github.com/lwin-kyaw)! - Fixed `getUserOperationError` runtime error.

- [#2880](https://github.com/wevm/viem/pull/2880) [`93af33e9ba7e27680567a7e46c96892cd2df992e`](https://github.com/wevm/viem/commit/93af33e9ba7e27680567a7e46c96892cd2df992e) Thanks [@Zhangnong](https://github.com/Zhangnong)! - Added Dymension chain.

## 2.21.28

### Patch Changes

- [#2870](https://github.com/wevm/viem/pull/2870) [`5734c4cc`](https://github.com/wevm/viem/commit/5734c4cc587dff7126229cbeaed222d2800027de) Thanks [@swetshaw](https://github.com/swetshaw)! - Updated Kararot Starknet Sepolia chain.

- [#2875](https://github.com/wevm/viem/pull/2875) [`fc9b81c3`](https://github.com/wevm/viem/commit/fc9b81c3f5a52a530f9b3aa9b470dafb117992ac) Thanks [@jxom](https://github.com/jxom)! - Added support for `wallet_sendTransaction`.

## 2.21.27

### Patch Changes

- [#2859](https://github.com/wevm/viem/pull/2859) [`5889209f`](https://github.com/wevm/viem/commit/5889209f74b00a3441b582e0bb29237ba94cdc1a) Thanks [@RobotMasterxo](https://github.com/RobotMasterxo)! - Added ql1 chain

- [#2867](https://github.com/wevm/viem/pull/2867) [`67617516`](https://github.com/wevm/viem/commit/676175167c6e8129361abcb24b8e95952072baa3) Thanks [@qi-0826](https://github.com/qi-0826)! - Added Chang Chain Foundation Mainnet.

- [`5c9ed2f2`](https://github.com/wevm/viem/commit/5c9ed2f22270512d65ea76ad6087d2512cd21ba2) Thanks [@jxom](https://github.com/jxom)! - Tweaked EIP-7702 types.

- [#2868](https://github.com/wevm/viem/pull/2868) [`8e74ea59`](https://github.com/wevm/viem/commit/8e74ea5946eb21d2fd815ee21d3a713ba881ee40) Thanks [@qi-0826](https://github.com/qi-0826)! - Added Hela chain.

## 2.21.26

### Patch Changes

- [#2857](https://github.com/wevm/viem/pull/2857) [`b42b1db`](https://github.com/wevm/viem/commit/b42b1dbe8aa6ace4eb196a4897aad799842a1645) Thanks [@Zhangnong](https://github.com/Zhangnong)! - Added Shiden chain.

- [#2864](https://github.com/wevm/viem/pull/2864) [`987924c`](https://github.com/wevm/viem/commit/987924c753e5c2259a3811d1903ef4b54e78626a) Thanks [@wanderer](https://github.com/wanderer)! - Added missing exports to `jsr.json`.

- [#2860](https://github.com/wevm/viem/pull/2860) [`3effd71`](https://github.com/wevm/viem/commit/3effd7143207ffee50406bb77ef870483d30d70f) Thanks [@vpontis](https://github.com/vpontis)! - Updated internal `keepAliveTimer` type.

- [#2858](https://github.com/wevm/viem/pull/2858) [`235ee2c`](https://github.com/wevm/viem/commit/235ee2cceca00dce5d3c733263bb8eb3cdf1352b) Thanks [@Zhangnong](https://github.com/Zhangnong)! - Added Ultron Mainnet.

## 2.21.25

### Patch Changes

- [#2844](https://github.com/wevm/viem/pull/2844) [`3140383`](https://github.com/wevm/viem/commit/31403839f81d153751cc8670ae0553576794f97d) Thanks [@coffeexcoin](https://github.com/coffeexcoin)! - Added ability for `onRequest` on the `http` transport to return request options.

- [#2853](https://github.com/wevm/viem/pull/2853) [`840531e`](https://github.com/wevm/viem/commit/840531e4e4502d25c3b09a462aa416428fca9e18) Thanks [@marthendalnunes](https://github.com/marthendalnunes)! - Narrowed return type of `signTransaction`.

- [#2850](https://github.com/wevm/viem/pull/2850) [`9e26e16`](https://github.com/wevm/viem/commit/9e26e166daf5a2b3525ce183b439b3ae40f517e9) Thanks [@plusminushalf](https://github.com/plusminushalf)! - **Account Abstraction:** Updated precedence of user-defined fee parameters in `prepareUserOperation`.

- [#2854](https://github.com/wevm/viem/pull/2854) [`1006a71`](https://github.com/wevm/viem/commit/1006a712aa6899f9d9d136d41d5dac2ea59f2dcc) Thanks [@jxom](https://github.com/jxom)! - Converted `from` to an optional parameter on `TransactionRequest`.

## 2.21.24

### Patch Changes

- [#2846](https://github.com/wevm/viem/pull/2846) [`38def97b`](https://github.com/wevm/viem/commit/38def97bf2786f4ed0c68afc94d0f2078c842ec3) Thanks [@fengbaolong](https://github.com/fengbaolong)! - Added Elastos chain.

- [#2847](https://github.com/wevm/viem/pull/2847) [`bd23492e`](https://github.com/wevm/viem/commit/bd23492e1b36b9f7bb2ccc412a9e165e809d1bb2) Thanks [@fengbaolong](https://github.com/fengbaolong)! - Added loop chain.

- [`65cd2c68`](https://github.com/wevm/viem/commit/65cd2c68ff5fd815ecc408a8f511120da5e01c0c) Thanks [@jxom](https://github.com/jxom)! - Added Odyssey Testnet.

## 2.21.23

### Patch Changes

- [#2843](https://github.com/wevm/viem/pull/2843) [`47c167b0`](https://github.com/wevm/viem/commit/47c167b0898d400814b5f3b62ebaf6594ceca75e) Thanks [@Kharabet](https://github.com/Kharabet)! - Added guruTestnet chain.

- [#2841](https://github.com/wevm/viem/pull/2841) [`5b8090ee`](https://github.com/wevm/viem/commit/5b8090ee4f6b828d290acaf596b88c5c2f78e565) Thanks [@dienho12](https://github.com/dienho12)! - Added DOSChain and DOSChain Testnet chain.

## 2.21.22

### Patch Changes

- [#2838](https://github.com/wevm/viem/pull/2838) [`f0695c5`](https://github.com/wevm/viem/commit/f0695c5c8c9fb29b78a7ca8c07b176191e550e39) Thanks [@qi-0826](https://github.com/qi-0826)! - Added Superposition chain.

- [#2840](https://github.com/wevm/viem/pull/2840) [`e9cf6ee`](https://github.com/wevm/viem/commit/e9cf6eea9bf15ee57a6db42a2502eda6a733e149) Thanks [@akshatmittal](https://github.com/akshatmittal)! - Added Unichain Sepolia Testnet chain.

- [`0ff9db8`](https://github.com/wevm/viem/commit/0ff9db844c9b2f11f3f726da20b132c0dc11d37f) Thanks [@jxom](https://github.com/jxom)! - Added `decodeCalls` as an optional property on `toSmartAccount`.

- [#2837](https://github.com/wevm/viem/pull/2837) [`2f46c00`](https://github.com/wevm/viem/commit/2f46c00e62c90f406da666b3544c427867135a84) Thanks [@qi-0826](https://github.com/qi-0826)! - Added Electroneum chain.

- [`95b316c`](https://github.com/wevm/viem/commit/95b316cb29375c9041ec5a92558cc975f41e9ba3) Thanks [@jxom](https://github.com/jxom)! - Added `stateOverride` to `estimateUserOperationGas` & `prepareUserOperation`.

## 2.21.21

### Patch Changes

- [#2834](https://github.com/wevm/viem/pull/2834) [`10dcb7ab`](https://github.com/wevm/viem/commit/10dcb7ab6ac5ecf1e46e8afa3245ffc21e245365) Thanks [@LordMarkDev](https://github.com/LordMarkDev)! - Added Zenchain Testnet

## 2.21.20

### Patch Changes

- [#2828](https://github.com/wevm/viem/pull/2828) [`fa546476`](https://github.com/wevm/viem/commit/fa5464766509a1806b0726ddea11e3ea2af34500) Thanks [@ezynda3](https://github.com/ezynda3)! - Updated opBNB Explorer URLs.

- [#2832](https://github.com/wevm/viem/pull/2832) [`4c928cba`](https://github.com/wevm/viem/commit/4c928cbaa01f89ba78989efa390579cb60a6759c) Thanks [@Zhangnong](https://github.com/Zhangnong)! - Added MAP Protocol chain.

- [#2830](https://github.com/wevm/viem/pull/2830) [`690f6f50`](https://github.com/wevm/viem/commit/690f6f507c86657336c102dec29d6740b3653691) Thanks [@Zhangnong](https://github.com/Zhangnong)! - Added Go Chain.

## 2.21.19

### Patch Changes

- [#2825](https://github.com/wevm/viem/pull/2825) [`66d7a1c9`](https://github.com/wevm/viem/commit/66d7a1c9685faa5c14b8ab7a6d02d5cbf5911319) Thanks [@fengbaolong](https://github.com/fengbaolong)! - Added Matchain.

- [`44ae1a55`](https://github.com/wevm/viem/commit/44ae1a5549e704486f2643c67f222ab3ce87cd47) Thanks [@jxom](https://github.com/jxom)! - **Account Abstraction:** Tweaked address caching in `toCoinbaseSmartAccount`.

- [#2827](https://github.com/wevm/viem/pull/2827) [`3fd43329`](https://github.com/wevm/viem/commit/3fd4332902b1181ae5332c2311bb3ba8725ad37b) Thanks [@posquit0](https://github.com/posquit0)! - Added bsquared chains

- [#2826](https://github.com/wevm/viem/pull/2826) [`4b1c3f1a`](https://github.com/wevm/viem/commit/4b1c3f1a0ab5972451f509a30616cd0826e418da) Thanks [@posquit0](https://github.com/posquit0)! - Added bitlayer chains

- [`04850399`](https://github.com/wevm/viem/commit/04850399fcc41a06c0aab7500f654665ead0c828) Thanks [@jxom](https://github.com/jxom)! - Updated dependencies.

- [`a965c5aa`](https://github.com/wevm/viem/commit/a965c5aa2f30a62b321d5cc5c908229b7c3a34aa) Thanks [@jxom](https://github.com/jxom)! - **Account Abstraction:** Fixed User Operation fee estimation when a Bundler Client contains custom `estimateFeesPerGas` hook.

- [#2822](https://github.com/wevm/viem/pull/2822) [`2bc5ff14`](https://github.com/wevm/viem/commit/2bc5ff146b52405c62f9d6996f66e0b39840b6ea) Thanks [@swetshaw](https://github.com/swetshaw)! - Added Kakarot Starknet Sepolia chain.

## 2.21.18

### Patch Changes

- [#2811](https://github.com/wevm/viem/pull/2811) [`03df7fbe`](https://github.com/wevm/viem/commit/03df7fbe0da3332a3ceee645d7ec6ede2a832010) Thanks [@shazarre](https://github.com/shazarre)! - Fixed Celo maxFeePerGas calculation for fee currency transactions.

- [#2817](https://github.com/wevm/viem/pull/2817) [`7c3653b2`](https://github.com/wevm/viem/commit/7c3653b2a1dda1876be396c587bf39da630dca72) Thanks [@0xArdy](https://github.com/0xArdy)! - Fixed Mode and Lisk chain definitions

- [#2813](https://github.com/wevm/viem/pull/2813) [`3e971248`](https://github.com/wevm/viem/commit/3e97124837095b53bfbbd7d9f5614c0afff276e6) Thanks [@qi-0826](https://github.com/qi-0826)! - Added Hemi Sepolia chain.

- [`da5a7b6f`](https://github.com/wevm/viem/commit/da5a7b6f54ecd813379259f6d5ceab56a4e7aac3) Thanks [@jxom](https://github.com/jxom)! - Added `mode` property to `TestClient.extends`.

- [#2818](https://github.com/wevm/viem/pull/2818) [`ce989d81`](https://github.com/wevm/viem/commit/ce989d81abefb825278d0748aef9e0ee6be79c91) Thanks [@GuillermoEscobero](https://github.com/GuillermoEscobero)! - Fixed Zircuit Testnet explorer and RPC URLs.

## 2.21.17

### Patch Changes

- [`2bf96a29`](https://github.com/wevm/viem/commit/2bf96a292e7a253716e32a4daddf5287375f9937) Thanks [@jxom](https://github.com/jxom)! - Accounted for undefined indexed arguments in `parseEventLogs`.

- [#2803](https://github.com/wevm/viem/pull/2803) [`08da9bd5`](https://github.com/wevm/viem/commit/08da9bd54776744dab82cfb574b6a9bca37c4bda) Thanks [@kevinb1003](https://github.com/kevinb1003)! - Added Zircuit chain.

- [#2800](https://github.com/wevm/viem/pull/2800) [`be02ea54`](https://github.com/wevm/viem/commit/be02ea54044b6645aa756a0cbb08f4d41fbebaa9) Thanks [@CeoFred](https://github.com/CeoFred)! - Added `assetChain` chain.

- [#2798](https://github.com/wevm/viem/pull/2798) [`0f83248f`](https://github.com/wevm/viem/commit/0f83248faf93ccab82f768c04eafb230d3d5bbc4) Thanks [@aaronmgdr](https://github.com/aaronmgdr)! - Added OP Stack contracts to Celo Alfajores.

- [#2799](https://github.com/wevm/viem/pull/2799) [`5b50774c`](https://github.com/wevm/viem/commit/5b50774c1069db7183ccfa4468290b1c87678182) Thanks [@impelcrypto](https://github.com/impelcrypto)! - Updated Soneium Minato Testnet

- [#2805](https://github.com/wevm/viem/pull/2805) [`74be4c3b`](https://github.com/wevm/viem/commit/74be4c3bcbbbab6c4d21e856f11701a17816e001) Thanks [@0oooooooo0](https://github.com/0oooooooo0)! - Updated Kaia Chain explorer.

## 2.21.16

### Patch Changes

- [`8abeb36c`](https://github.com/wevm/viem/commit/8abeb36c9fb6072c6e12ce3662299bfb4c7a28fa) Thanks [@jxom](https://github.com/jxom)! - **Account Abstraction**: Fixed nullish chain handling for paymaster data in `prepareUserOperation`.

- [#2780](https://github.com/wevm/viem/pull/2780) [`e0e0955c`](https://github.com/wevm/viem/commit/e0e0955c6cbe1c32c2ea35f5d39662ec25f392cf) Thanks [@sina-london](https://github.com/sina-london)! - Added fusion chain

- [#2786](https://github.com/wevm/viem/pull/2786) [`4d692d47`](https://github.com/wevm/viem/commit/4d692d478b450148f9040a8301f08f817d700e43) Thanks [@sina-london](https://github.com/sina-london)! - Added BounceBit chain.

- [#2791](https://github.com/wevm/viem/pull/2791) [`e171fb72`](https://github.com/wevm/viem/commit/e171fb72b90dc30a45367445823602119afdea79) Thanks [@sandyup](https://github.com/sandyup)! - Added vision chain.

- [#2789](https://github.com/wevm/viem/pull/2789) [`b61a2316`](https://github.com/wevm/viem/commit/b61a231670a603f14151975d5eb92837581f8f86) Thanks [@sina-london](https://github.com/sina-london)! - Added viction chain.

- [`be2298cb`](https://github.com/wevm/viem/commit/be2298cbae6655d8d1622fbaf5f51e9a3c69b0d3) Thanks [@jxom](https://github.com/jxom)! - **Account Abstraction**: Allowed override of `signature` property in `prepareUserOperation`.

- [#2779](https://github.com/wevm/viem/pull/2779) [`9a7461ec`](https://github.com/wevm/viem/commit/9a7461ec0377c8d9c53a8e152c553066408c2433) Thanks [@tom-jordan1](https://github.com/tom-jordan1)! - Added hychain.

- [#2787](https://github.com/wevm/viem/pull/2787) [`1a515531`](https://github.com/wevm/viem/commit/1a515531d6c0f1e3fc036b40622435bd84bbd80d) Thanks [@peterhappynow](https://github.com/peterhappynow)! - Added multicall3 contract for Flare Mainnet.

- [#2781](https://github.com/wevm/viem/pull/2781) [`9d7d1602`](https://github.com/wevm/viem/commit/9d7d1602aa103f9db15f2b696944430c8ef643f7) Thanks [@peterhappynow](https://github.com/peterhappynow)! - Added Multicall address for `areon`.

- [#2788](https://github.com/wevm/viem/pull/2788) [`320e2dc4`](https://github.com/wevm/viem/commit/320e2dc468248168691e6d3f3e2705d33e52c423) Thanks [@maxknivets](https://github.com/maxknivets)! - Added WeaveVM Alphanet chain.

## 2.21.15

### Patch Changes

- [#2776](https://github.com/wevm/viem/pull/2776) [`c40e999a`](https://github.com/wevm/viem/commit/c40e999a996b950995fd49e149112e93109f854a) Thanks [@Svg70](https://github.com/Svg70)! - Added Unique chains.

- [#2772](https://github.com/wevm/viem/pull/2772) [`679eccfa`](https://github.com/wevm/viem/commit/679eccfa1883ed24fc1b41866387eade526e70a2) Thanks [@tom-jordan1](https://github.com/tom-jordan1)! - Added SuperLumio chain.

- [#2764](https://github.com/wevm/viem/pull/2764) [`e0a63169`](https://github.com/wevm/viem/commit/e0a631695095243364123ce5dd63691e4e913d04) Thanks [@j6i](https://github.com/j6i)! - Added Shape chain.

- [#2769](https://github.com/wevm/viem/pull/2769) [`ed22d380`](https://github.com/wevm/viem/commit/ed22d3808d8ce0ce0e2498c74cf14a089561a1b5) Thanks [@tuna1207](https://github.com/tuna1207)! - Fixed undefined reference in `getNodeError`.

- [#2774](https://github.com/wevm/viem/pull/2774) [`000a2dcc`](https://github.com/wevm/viem/commit/000a2dccd27894294d1b06634a0e0723b88dddce) Thanks [@aqeelVaival](https://github.com/aqeelVaival)! - Added `elysiumTestnet` chain.

- [`aadeada3`](https://github.com/wevm/viem/commit/aadeada3823ec2a216416bbb4c83465259c32909) Thanks [@jxom](https://github.com/jxom)! - Added default `timeout` to `waitForTransactionReceipt`.

- [#2770](https://github.com/wevm/viem/pull/2770) [`c4868b5e`](https://github.com/wevm/viem/commit/c4868b5effce7a7c03a8fd7ea3eeea2ad15ebab1) Thanks [@jeff-0402](https://github.com/jeff-0402)! - Added Optopia chain.

- [#2768](https://github.com/wevm/viem/pull/2768) [`44faceea`](https://github.com/wevm/viem/commit/44faceeadebfe4c9335b44cfc3a310bb229d484a) Thanks [@barrasso](https://github.com/barrasso)! - Added Snax chain.

- [`e2b2a48b`](https://github.com/wevm/viem/commit/e2b2a48b98ad431d4fb9f2e8fdf5b718a77b251d) Thanks [@jxom](https://github.com/jxom)! - Added better handling for HTTP error text responses.

## 2.21.14

### Patch Changes

- [`c7c737a4`](https://github.com/wevm/viem/commit/c7c737a472a7b5a46b12340071f9e9480d3975dd) Thanks [@jxom](https://github.com/jxom)! - Added `delegate` parameter to `signAuthorization`.

## 2.21.13

### Patch Changes

- [#2759](https://github.com/wevm/viem/pull/2759) [`81967929`](https://github.com/wevm/viem/commit/81967929e7e5b105753ae68dbbd24bbbb59f1e1b) Thanks [@codespool](https://github.com/codespool)! - Updated AstarZkEVM RPC URL.

- [#2756](https://github.com/wevm/viem/pull/2756) [`5e1a13de`](https://github.com/wevm/viem/commit/5e1a13de8d116d176393b4ac93d7933d8d16a676) Thanks [@jeff-0402](https://github.com/jeff-0402)! - Added Mint chain.

- [#2761](https://github.com/wevm/viem/pull/2761) [`9ed514a9`](https://github.com/wevm/viem/commit/9ed514a95a73bb248d15d670fd34c3af92a8e956) Thanks [@tom-jordan1](https://github.com/tom-jordan1)! - Added AlienX chain.

- [#2760](https://github.com/wevm/viem/pull/2760) [`b70fc5e8`](https://github.com/wevm/viem/commit/b70fc5e8fd768d6866cc42a1de515d39d2b81bc2) Thanks [@tom-jordan1](https://github.com/tom-jordan1)! - Added Swan chain.

- [#2757](https://github.com/wevm/viem/pull/2757) [`60dacc16`](https://github.com/wevm/viem/commit/60dacc16bf2804ee0e70f7eb51401dd06030dc8d) Thanks [@jeff-0402](https://github.com/jeff-0402)! - Added Kinto chain.

- [#2762](https://github.com/wevm/viem/pull/2762) [`02d69e6f`](https://github.com/wevm/viem/commit/02d69e6f92dedcd5454dc9abdbdd94fb68c0da59) Thanks [@ezynda3](https://github.com/ezynda3)! - Added missing API URL for `xLayer`.

## 2.21.12

### Patch Changes

- [#2752](https://github.com/wevm/viem/pull/2752) [`ba36b3d`](https://github.com/wevm/viem/commit/ba36b3d822aac4c6e9652a5a6e88ee3248c9098a) Thanks [@jeff-0402](https://github.com/jeff-0402)! - Added Orderly chain.

- [#2750](https://github.com/wevm/viem/pull/2750) [`5c07596`](https://github.com/wevm/viem/commit/5c075965d2695b78bb3cb44cdbe9e27715e184cd) Thanks [@jaybbbb](https://github.com/jaybbbb)! - Added Silicon chains.

## 2.21.11

### Patch Changes

- [#2742](https://github.com/wevm/viem/pull/2742) [`38e411d`](https://github.com/wevm/viem/commit/38e411d379aef6171c35c01afe10cf9f52dfb430) Thanks [@dbeal-eth](https://github.com/dbeal-eth)! - Added Cannon chain.

- [#2729](https://github.com/wevm/viem/pull/2729) [`91e34c8`](https://github.com/wevm/viem/commit/91e34c8da4b00fb1649e552450eba3794a9e8887) Thanks [@ezynda3](https://github.com/ezynda3)! - Fixed BSC Testnet API URL.

- [#2747](https://github.com/wevm/viem/pull/2747) [`ce6a84d`](https://github.com/wevm/viem/commit/ce6a84db20708d747a16ffac67206b0929174e36) Thanks [@nitaliano](https://github.com/nitaliano)! - **OP Stack**: Fixed bug in getWithdrawalStatus for pre fault proof withdrawals

## 2.21.10

### Patch Changes

- [#2738](https://github.com/wevm/viem/pull/2738) [`15c71b6`](https://github.com/wevm/viem/commit/15c71b6dacc3abe9ed0ac0fc9c21c9b70c2072e5) Thanks [@johncpalmer](https://github.com/johncpalmer)! - Added World Chain

## 2.21.9

### Patch Changes

- [`312160a`](https://github.com/wevm/viem/commit/312160a384c4a9f5937d9213829e1d7b5d067b8f) Thanks [@jxom](https://github.com/jxom)! - Fixed issue where `watchBlock` would not respect the `emitOnBegin` property for WebSocket Transports.

- [`b509c6e`](https://github.com/wevm/viem/commit/b509c6e6dbc4ff7a8f5fc202c3956d01b63efe3d) Thanks [@jxom](https://github.com/jxom)! - Fixed `mnemonicToAccount` options type.

## 2.21.8

### Patch Changes

- [#2724](https://github.com/wevm/viem/pull/2724) [`c2b2c78`](https://github.com/wevm/viem/commit/c2b2c7887eb27ffe1e1db534036a0bb7ef3cad5c) Thanks [@cygaar](https://github.com/cygaar)! - Reverted custom Abstract EIP712 domain changes.

- [`2fa3d00`](https://github.com/wevm/viem/commit/2fa3d004467945efc548ac23a659c32a1e206cc4) Thanks [@jxom](https://github.com/jxom)! - Fixed zeroish log filter argument parsing.

## 2.21.7

### Patch Changes

- [`644f72d`](https://github.com/wevm/viem/commit/644f72db0ac08808918917b2610e403d9bd1bb64) Thanks [@jxom](https://github.com/jxom)! - Fixed an issue where `hashAuthorization` & `serializeAuthorizationList` did not RLP-serialize zeroish nonces correctly.

- [#2719](https://github.com/wevm/viem/pull/2719) [`7fdb149`](https://github.com/wevm/viem/commit/7fdb14929f2446555315df4cf1b99bc086dd8d6b) Thanks [@sammdec](https://github.com/sammdec)! - Added `parentBeaconBlockRoot` to `Block` type.

- [#2722](https://github.com/wevm/viem/pull/2722) [`0b5c7b6`](https://github.com/wevm/viem/commit/0b5c7b6e273cb00834099ec78e4e9555a3c34d5e) Thanks [@coffeexcoin](https://github.com/coffeexcoin)! - Added multicall3 contract for Abstract Testnet.

## 2.21.6

### Patch Changes

- [#2715](https://github.com/wevm/viem/pull/2715) [`ca2909a1`](https://github.com/wevm/viem/commit/ca2909a1cf15e0e0647b868ca1732ceb3ae44b19) Thanks [@bh2smith](https://github.com/bh2smith)! - Updated Sepolia RPC URL.

- [#2713](https://github.com/wevm/viem/pull/2713) [`35220f1c`](https://github.com/wevm/viem/commit/35220f1cbb327be29ccaf0c7d1cef5275f81bea8) Thanks [@holic](https://github.com/holic)! - Added Garnet chain.
  Updated Redstone chain.

## 2.21.5

### Patch Changes

- [`175e90b3`](https://github.com/wevm/viem/commit/175e90b33487017108af7563f030a54cd427c7c3) Thanks [@jxom](https://github.com/jxom)! - Restructured exports for wordlists.

- [`4e9ea723`](https://github.com/wevm/viem/commit/4e9ea723d87aebd9c02dbe28ed85e862e537d757) Thanks [@jxom](https://github.com/jxom)! - Improved performance of `parseEventLogs`

- [#2712](https://github.com/wevm/viem/pull/2712) [`aa57cf1a`](https://github.com/wevm/viem/commit/aa57cf1ad36554f3c50d3b2c88ee0b58410ccbf3) Thanks [@RareData](https://github.com/RareData)! - Updated naming for Flare chains.

## 2.21.4

### Patch Changes

- [`9de10f8`](https://github.com/wevm/viem/commit/9de10f83937e9b76316d31c567d6e0ff879d569d) Thanks [@jxom](https://github.com/jxom)! - **Account Abstraction:** Updated `getPaymasterData` + `getPaymasterStubData` return types to match ERC-7677 specification.

- [#2659](https://github.com/wevm/viem/pull/2659) [`24bdc50`](https://github.com/wevm/viem/commit/24bdc504ae0197c771dba1e63dbbecabfdfa723f) Thanks [@owen-reorg](https://github.com/owen-reorg)! - Added OP Stack addresses to opBNB Chain.

- [#2708](https://github.com/wevm/viem/pull/2708) [`6dfadec`](https://github.com/wevm/viem/commit/6dfadecf597ded6a0579ff919b94abc36bc7f325) Thanks [@0x-jj](https://github.com/0x-jj)! - Updated Shape Sepolia definition.

## 2.21.3

### Patch Changes

- [#2693](https://github.com/wevm/viem/pull/2693) [`764f259f`](https://github.com/wevm/viem/commit/764f259f016dda7817def229adedea65cd6b9d63) Thanks [@kyscott18](https://github.com/kyscott18)! - Fixed LRU algorithm to update touched keys.

- [#2692](https://github.com/wevm/viem/pull/2692) [`70814af6`](https://github.com/wevm/viem/commit/70814af6fb6ef90ee68c74b12998295a229c5435) Thanks [@frapsMatheus](https://github.com/frapsMatheus)! - Replaced instances of `2n ** 256n - 1n` with the `maxUint256` constant.

- [#2698](https://github.com/wevm/viem/pull/2698) [`02734f32`](https://github.com/wevm/viem/commit/02734f3216ed15353ae2b39738c89a06faba533b) Thanks [@abs3ntdev](https://github.com/abs3ntdev)! - Update Polygon's native token from MATIC to POL

- [`c5ecc8f`](https://github.com/wevm/viem/commit/c5ecc8f54d21b21bc36f722fe9b240dc75527971) Thanks [@jxom](https://github.com/jxom)! - Added extra error handling in unit parsing.

## 2.21.2

### Patch Changes

- [#2682](https://github.com/wevm/viem/pull/2682) [`68be3ba0`](https://github.com/wevm/viem/commit/68be3ba0a6942818f8e0c17ca419e8b5b9e93151) Thanks [@KONFeature](https://github.com/KONFeature)! - Exported `getPaymasterData` and `getPaymasterStubData`.

- [`7f18a3cf`](https://github.com/wevm/viem/commit/7f18a3cfd7478200be6a25b282628656b274ec88) Thanks [@tmm](https://github.com/tmm)! - Bumped scure-bip39.

- [#2686](https://github.com/wevm/viem/pull/2686) [`e7431e88`](https://github.com/wevm/viem/commit/e7431e88b0e8b83719c91f5a6a57da1a10076a1c) Thanks [@sakulstra](https://github.com/sakulstra)! - Fixed Metis Explorer API URL.

- [#2672](https://github.com/wevm/viem/pull/2672) [`a541519c`](https://github.com/wevm/viem/commit/a541519c12bdd7fb91e3534cc3a9c576a33b8acb) Thanks [@bthaile](https://github.com/bthaile)! - Deprecated Flow Previewnet.

- [`c11d92ff`](https://github.com/wevm/viem/commit/c11d92ffdc0b333f6a6a7bd8d716a45c5ae0dc0d) Thanks [@tmm](https://github.com/tmm)! - Removed non-default chain properties.

## 2.21.1

### Patch Changes

- [#2674](https://github.com/wevm/viem/pull/2674) [`962d3697`](https://github.com/wevm/viem/commit/962d36970b3f46a8705a4ce3f513f3eae20623f1) Thanks [@Haypierre](https://github.com/Haypierre)! - Added ZKsync config to Sophon testnet chain.

- [#2678](https://github.com/wevm/viem/pull/2678) [`5c258595`](https://github.com/wevm/viem/commit/5c25859584b0fd675f0f9660e9227453edfc6e64) Thanks [@joaquim-verges](https://github.com/joaquim-verges)! - **Extension (ZKsync):** Exported `encodeDeployData` and `hashBytecode`.

## 2.21.0

### Minor Changes

- [#2665](https://github.com/wevm/viem/pull/2665) [`2e05c52`](https://github.com/wevm/viem/commit/2e05c52abea485475afa72523a4da0410cd4316c) Thanks [@jxom](https://github.com/jxom)! - Added built-in support for Linea gas & fee estimations.

- [#2665](https://github.com/wevm/viem/pull/2665) [`2e05c52`](https://github.com/wevm/viem/commit/2e05c52abea485475afa72523a4da0410cd4316c) Thanks [@jxom](https://github.com/jxom)! - Deprecated `chain.fees.defaultPriorityFee`, use `chain.fees.maxPriorityFeePerGas` instead.

### Patch Changes

- [#2670](https://github.com/wevm/viem/pull/2670) [`d1ca95c`](https://github.com/wevm/viem/commit/d1ca95ce1dd2f8849c2cece5b2b4bbd56838d241) Thanks [@crystalbit](https://github.com/crystalbit)! - Added Fluence, Fluence Testnet, and Fluence Stage.

- [#2662](https://github.com/wevm/viem/pull/2662) [`d88eb42`](https://github.com/wevm/viem/commit/d88eb42d42d880957993f0afe4dca563b39e6e1c) Thanks [@parseb](https://github.com/parseb)! - Added Soneium Minato testnet

- [`dc3c0a0`](https://github.com/wevm/viem/commit/dc3c0a00296f53dca01f4cd58046107d216f30ee) Thanks [@jxom](https://github.com/jxom)! - Added `nonceManager` parameter to `prepareTransactionRequest`.

- [#2664](https://github.com/wevm/viem/pull/2664) [`5c3ed45`](https://github.com/wevm/viem/commit/5c3ed45ca7d32bf6b5cb96dc0f90fd30cb903680) Thanks [@abs3ntdev](https://github.com/abs3ntdev)! - Added Tron chain

- [#2666](https://github.com/wevm/viem/pull/2666) [`e026509`](https://github.com/wevm/viem/commit/e026509d86233ce7d70bde6f372ebf0cce3bc7a3) Thanks [@cong1223](https://github.com/cong1223)! - Added storyTestnet

- [#2660](https://github.com/wevm/viem/pull/2660) [`2813fbd`](https://github.com/wevm/viem/commit/2813fbd218a54c99d92f1e29e5ca1b2961a06071) Thanks [@RobbyUitbeijerse](https://github.com/RobbyUitbeijerse)! - Adjusted sophon native token symbol.

## 2.20.1

### Patch Changes

- [#2646](https://github.com/wevm/viem/pull/2646) [`50bde96b`](https://github.com/wevm/viem/commit/50bde96b39e4e2980e995f5288ea9b6a2f62a530) Thanks [@thobbyAk](https://github.com/thobbyAk)! - Added Botanix Testnet.

- [#2644](https://github.com/wevm/viem/pull/2644) [`2eb817a2`](https://github.com/wevm/viem/commit/2eb817a25bfe0bfdb36df02c7907f38b889f474a) Thanks [@RobbyUitbeijerse](https://github.com/RobbyUitbeijerse)! - Added Sophon Testnet.

- [#2656](https://github.com/wevm/viem/pull/2656) [`df905fe5`](https://github.com/wevm/viem/commit/df905fe5dd87e1a2a78494eba1845c6012606a51) Thanks [@Jabher](https://github.com/Jabher)! - Added Holesky API URL.

- [#2654](https://github.com/wevm/viem/pull/2654) [`02415bce`](https://github.com/wevm/viem/commit/02415bcef331eeeee18f5e427766048b6fb33a96) Thanks [@lyszhang](https://github.com/lyszhang)! - Added Hashkey Chain testnet.

- [#2657](https://github.com/wevm/viem/pull/2657) [`f31e93ec`](https://github.com/wevm/viem/commit/f31e93ec5ad65e551bb3a152f138aff3a157b9f6) Thanks [@jeanregisser](https://github.com/jeanregisser)! - Exported `portuguese` wordlist.

- [#2643](https://github.com/wevm/viem/pull/2643) [`8ac740e9`](https://github.com/wevm/viem/commit/8ac740e9cec18a3138a771053eeb45397179885a) Thanks [@0oooooooo0](https://github.com/0oooooooo0)! - Added kaia chain.

- [#2655](https://github.com/wevm/viem/pull/2655) [`4d874283`](https://github.com/wevm/viem/commit/4d8742836f53753e3ab1312c8aa3a66284253d22) Thanks [@RobbyUitbeijerse](https://github.com/RobbyUitbeijerse)! - Added multicall3 to Sophon Testnet.

## 2.20.0

### Minor Changes

- [#2641](https://github.com/wevm/viem/pull/2641) [`89d11ed`](https://github.com/wevm/viem/commit/89d11edb558656bc3c97f0c410a448f99f92a1f4) Thanks [@jxom](https://github.com/jxom)! - **Experimental:** Deprecated `writeContracts`. Use `sendCalls` instead.

- [#2641](https://github.com/wevm/viem/pull/2641) [`89d11ed`](https://github.com/wevm/viem/commit/89d11edb558656bc3c97f0c410a448f99f92a1f4) Thanks [@jxom](https://github.com/jxom)! - **Experimental:** Updated `sendCalls` to match the updated EIP-5792 spec (`chainId` per call).

- [#2641](https://github.com/wevm/viem/pull/2641) [`89d11ed`](https://github.com/wevm/viem/commit/89d11edb558656bc3c97f0c410a448f99f92a1f4) Thanks [@jxom](https://github.com/jxom)! - **Experimental:** Updated `sendCalls` to also accept contract function interface.

### Patch Changes

- [#2638](https://github.com/wevm/viem/pull/2638) [`9cbd082`](https://github.com/wevm/viem/commit/9cbd0820533c278bb4e40ff390a7091a607152b3) Thanks [@jxom](https://github.com/jxom)! - Added \`nonceKeyManager\` as a property to \`toSmartAccount\`.

- [#2638](https://github.com/wevm/viem/pull/2638) [`9cbd082`](https://github.com/wevm/viem/commit/9cbd0820533c278bb4e40ff390a7091a607152b3) Thanks [@jxom](https://github.com/jxom)! - Added ability to pass full-formed User Operations to `sendUserOperation` and `estimateUserOperationGas`.

- [#2639](https://github.com/wevm/viem/pull/2639) [`9a1c6ab`](https://github.com/wevm/viem/commit/9a1c6abe6c89c444c8fc28cea1fc6ef9759ae53b) Thanks [@jxom](https://github.com/jxom)! - **OP Stack:** Tweaked proof submitter logic.

## 2.19.9

### Patch Changes

- [#2598](https://github.com/wevm/viem/pull/2598) [`627274b`](https://github.com/wevm/viem/commit/627274b0cf70906d6d521f53e3290a87bcaee2b3) Thanks [@jxom](https://github.com/jxom)! - Added ZKsync `toSmartAccount`.

- [#2636](https://github.com/wevm/viem/pull/2636) [`5f60093`](https://github.com/wevm/viem/commit/5f6009360eaa41caf7318deb832dae7484190b5b) Thanks [@saeta-eth](https://github.com/saeta-eth)! - Added support for `'evm_setAccountCode'` to `setCode` action.

## 2.19.8

### Patch Changes

- [#2631](https://github.com/wevm/viem/pull/2631) [`b36cb2db`](https://github.com/wevm/viem/commit/b36cb2dbe7c83c36c54810839506399cf2882945) Thanks [@jxom](https://github.com/jxom)! - **OP Stack:** Handled case for `InvalidGameType` error on `getWithdrawalStatus`

## 2.19.7

### Patch Changes

- [#2624](https://github.com/wevm/viem/pull/2624) [`46dd252`](https://github.com/wevm/viem/commit/46dd2523a96d8372b0d0cb5ffe56c613bf073048) Thanks [@holic](https://github.com/holic)! - Improved `writeContract` error handling.

- [#2628](https://github.com/wevm/viem/pull/2628) [`a040bc4`](https://github.com/wevm/viem/commit/a040bc430293604cd8532c3f6349a56b2a5d366a) Thanks [@boavenn](https://github.com/boavenn)! - Added cronoszkEVM chain.

- [`918bed5`](https://github.com/wevm/viem/commit/918bed5ee48b39b08d8ab8e879722358cc91ec56) Thanks [@jxom](https://github.com/jxom)! - Update 7702 implementation to be compatible with devnet3.

- [#2629](https://github.com/wevm/viem/pull/2629) [`34093e1`](https://github.com/wevm/viem/commit/34093e12076639f110017cb5f9196884608eb76c) Thanks [@KONFeature](https://github.com/KONFeature)! - Exported `PaymasterRpcSchema`.

- [#2625](https://github.com/wevm/viem/pull/2625) [`507eed7`](https://github.com/wevm/viem/commit/507eed7284c2ac6867fef850a0e2923b9078671e) Thanks [@qiwu7](https://github.com/qiwu7)! - Added B3 chain

## 2.19.6

### Patch Changes

- [#2619](https://github.com/wevm/viem/pull/2619) [`ccaddcd9`](https://github.com/wevm/viem/commit/ccaddcd909b5f957f9b8352f7646f349402bb776) Thanks [@nialexsan](https://github.com/nialexsan)! - Added Multicall contract to Flow Testnet.

- [#2620](https://github.com/wevm/viem/pull/2620) [`a8c78cb4`](https://github.com/wevm/viem/commit/a8c78cb4cbd5224259482114c6d65ce5b0b10f6b) Thanks [@jxom](https://github.com/jxom)! - Made `getNonce` optional on `SmartAccountImplementation`.

- [#2614](https://github.com/wevm/viem/pull/2614) [`3749838f`](https://github.com/wevm/viem/commit/3749838fdd915ebccc56505ecd5a8047bfb8f38d) Thanks [@joshuanwankwo](https://github.com/joshuanwankwo)! - Added Curtis chain

## 2.19.5

### Patch Changes

- [#2608](https://github.com/wevm/viem/pull/2608) [`cff2aac6`](https://github.com/wevm/viem/commit/cff2aac683f4e2e60e8ce84e3933f02b31311ed0) Thanks [@HighGecko](https://github.com/HighGecko)! - Added IOTA, IOTA Testnet and CHIPS chains.

- [#2609](https://github.com/wevm/viem/pull/2609) [`bf0fe9c6`](https://github.com/wevm/viem/commit/bf0fe9c653697a2eadc16ec2ce53d149b10d68a8) Thanks [@CeoFred](https://github.com/CeoFred)! - Added AssetChain Testnet chain.

## 2.19.4

### Patch Changes

- [`e708c5bd`](https://github.com/wevm/viem/commit/e708c5bd5dea9ee97fefaf6c4bf1d70080898851) Thanks [@jxom](https://github.com/jxom)! - Updated zkSync `getEip712Domain` name.

- [#2606](https://github.com/wevm/viem/pull/2606) [`44cc5ecd`](https://github.com/wevm/viem/commit/44cc5ecd6bca2ee81ab2db0cd4ae273310f37302) Thanks [@ezynda3](https://github.com/ezynda3)! - Updated Taiko block explorer.

- [`9aaa159f`](https://github.com/wevm/viem/commit/9aaa159f8e3f0aef45248368a2dd65a16e101c90) Thanks [@jxom](https://github.com/jxom)! - Removed redundant chain assertion for Local Accounts.

## 2.19.3

### Patch Changes

- [#2595](https://github.com/wevm/viem/pull/2595) [`e022146`](https://github.com/wevm/viem/commit/e022146393bc3f3f315f2cf6a5b419adc1e5983d) Thanks [@gregfromstl](https://github.com/gregfromstl)! - Exported `universalSignatureValidatorAbi`.

- [#2596](https://github.com/wevm/viem/pull/2596) [`cb127ab`](https://github.com/wevm/viem/commit/cb127ab7d1334c7a73dfdc1d22ba4e4e7fa868dc) Thanks [@danielsimao](https://github.com/danielsimao)! - Added Bob Sepolia chain.
  Added OP Stack addresses to Bob chain.

## 2.19.2

### Patch Changes

- [`d22855b`](https://github.com/wevm/viem/commit/d22855b03ec89beb04a1f5479612f311adc592f9) Thanks [@jxom](https://github.com/jxom)! - Exported `deploylessCallViaBytecodeBytecode`, `deploylessCallViaFactoryBytecode`, `universalSignatureValidatorByteCode`.

- [#2593](https://github.com/wevm/viem/pull/2593) [`2aa381d`](https://github.com/wevm/viem/commit/2aa381dda8d15695fe130f8f553f32b90d2dca33) Thanks [@zongzheng123](https://github.com/zongzheng123)! - Added multicall configuration for iotex testnet.

- [`8ef99aa`](https://github.com/wevm/viem/commit/8ef99aa0c7bfacf2022ed63602e4874adefe3cdd) Thanks [@jxom](https://github.com/jxom)! - **Experimental:** Deprecated `soladyActions` in favor of `erc7739Actions`.

- [#2594](https://github.com/wevm/viem/pull/2594) [`4b3c1e6`](https://github.com/wevm/viem/commit/4b3c1e65e18ddab78f83ecfae96bde11a0d42495) Thanks [@kirillovmr](https://github.com/kirillovmr)! - Fixed websocket ping request not conforming to jsonrpc schema.

- [`a6d087e`](https://github.com/wevm/viem/commit/a6d087e8121cdf04ad2321e9a0eb9c5eb37267c7) Thanks [@jxom](https://github.com/jxom)! - Fixed ABI inference on `prepareEncodeFunctionData`

- [#2589](https://github.com/wevm/viem/pull/2589) [`171ede1`](https://github.com/wevm/viem/commit/171ede1f6ebb9c1c463beb2332f51c15769f50fd) Thanks [@venables](https://github.com/venables)! - Added multicall to X Layer chain.

## 2.19.1

### Patch Changes

- [`91aafc0`](https://github.com/wevm/viem/commit/91aafc0442cc5f96db3818f94b4d38d62eebe856) Thanks [@jxom](https://github.com/jxom)! - Added `name` to `ResourceNotFoundRpcErrorType`

## 2.19.0

### Minor Changes

- [#2570](https://github.com/wevm/viem/pull/2570) [`fee80a9a`](https://github.com/wevm/viem/commit/fee80a9ae3e425354f21a6de5fa397244577eb28) Thanks [@jxom](https://github.com/jxom)! - **Experimental:** Added EIP-7702 Extension. [See Docs](https://viem.sh/docs/eip7702)

- [#2586](https://github.com/wevm/viem/pull/2586) [`0b1693aa`](https://github.com/wevm/viem/commit/0b1693aa51468cfe77dae74ad44bd89dfd21fd0e) Thanks [@tmm](https://github.com/tmm)! - Renamed "zkSync" to "ZKsync":
  - Context: "zkSync" was officially renamed to "ZKsync" a while ago.
  - Variable names: `zkSync` -> `zksync` (for simplicity and consistency between folder/file names and variables).
  - Types: `ZkSync` -> `Zksync`.
  - Old naming still remains in Viem, however is marked as `@deprecated` and will be removed in the next major release.

  Removed deprecated `zkSyncTestnet` chain.

- [#2583](https://github.com/wevm/viem/pull/2583) [`b5aa9651`](https://github.com/wevm/viem/commit/b5aa9651c7618b3ee5e952857f330e12f3bb9fbf) Thanks [@jxom](https://github.com/jxom)! - Added ability for consumer (libraries built on top of Viem) to globally configure properties on `BaseError`.

  ```ts
  import { setErrorConfig } from 'viem'

  setErrorConfig({
    getDocsUrl({ name }) {
      return `https://examplelib.com?error=${name}`
    }
    version: 'examplelib@1.2.3'
  })
  ```

### Patch Changes

- [#2581](https://github.com/wevm/viem/pull/2581) [`837507f6`](https://github.com/wevm/viem/commit/837507f6dcc41e928419b2377e00913fc75033f9) Thanks [@cygaar](https://github.com/cygaar)! - Added ZKsync config to Abstract Testnet chain.

- [#2561](https://github.com/wevm/viem/pull/2561) [`1c5d64a3`](https://github.com/wevm/viem/commit/1c5d64a36e88be963a9724d3abdd6f55b8c2e7b9) Thanks [@Yuripetusko](https://github.com/Yuripetusko)! - Fixed #2560: infer the correct payable `value` type on function overloads by matching function against `args`.

## 2.18.8

### Patch Changes

- [#2577](https://github.com/wevm/viem/pull/2577) [`7abfb47`](https://github.com/wevm/viem/commit/7abfb47a78febcfccefb9ecb3aa061e00eb92f32) Thanks [@qiwu7](https://github.com/qiwu7)! - Added B3 Sepolia chain.

- [#2576](https://github.com/wevm/viem/pull/2576) [`4172928`](https://github.com/wevm/viem/commit/4172928f5dfa3645b7d441d2af0959b6f275bffb) Thanks [@jonathangus](https://github.com/jonathangus)! - Added Abstract Testnet

## 2.18.7

### Patch Changes

- [`55ef649`](https://github.com/wevm/viem/commit/55ef649e060c791fbf21fa4fa180fcf411c36799) Thanks [@jxom](https://github.com/jxom)! - Fixed chain config for `lisk`.

- [#2571](https://github.com/wevm/viem/pull/2571) [`39c0ce0`](https://github.com/wevm/viem/commit/39c0ce04c4e757c33eb635a4d72029eb28bb5438) Thanks [@j6i](https://github.com/j6i)! - Added Shape Sepolia chain.

## 2.18.6

### Patch Changes

- [`889371e`](https://github.com/wevm/viem/commit/889371e3d62b8c6044c463f933bc49c4f00e742b) Thanks [@jxom](https://github.com/jxom)! - Hooked `onError` up to WebSocket `subscribe`.

- [#2552](https://github.com/wevm/viem/pull/2552) [`84e7d30`](https://github.com/wevm/viem/commit/84e7d30dec0a45503dd6a6b30893e369c75ab92a) Thanks [@wilsoncusack](https://github.com/wilsoncusack)! - Fixed ERC6492 verification for case where prepare data may need to be called.

## 2.18.5

### Patch Changes

- [`5babc8d2`](https://github.com/wevm/viem/commit/5babc8d2bc408467912db7fc8de10123944b7d47) Thanks [@jxom](https://github.com/jxom)! - Added more robust WebSocket socket closure handling.

- [#2555](https://github.com/wevm/viem/pull/2555) [`9be9b2cc`](https://github.com/wevm/viem/commit/9be9b2cc99e5aa26e67dbfaaf11f0dd6aa8c49f3) Thanks [@mycodecrafting](https://github.com/mycodecrafting)! - Added Forma mainnet and Sketchpad testnet chains.

## 2.18.4

### Patch Changes

- [`5a528d9b`](https://github.com/wevm/viem/commit/5a528d9b24cbdd495371ce69a290ad9358e4c358) Thanks [@jxom](https://github.com/jxom)! - Propagated `message` + `cause` to root `Error` instance.

## 2.18.3

### Patch Changes

- [#2545](https://github.com/wevm/viem/pull/2545) [`6811b47`](https://github.com/wevm/viem/commit/6811b472ae9e84940e8570240ebe000b16bf3284) Thanks [@ezynda3](https://github.com/ezynda3)! - Added Gravity Alpha Mainnet chain.

## 2.18.2

### Patch Changes

- [#2516](https://github.com/wevm/viem/pull/2516) [`44281e8`](https://github.com/wevm/viem/commit/44281e85e28f893df6e722ebadfe74b2a9bf93e2) Thanks [@izayl](https://github.com/izayl)! - Added `keepAlive` property to `webSocket` transport to send keep-alive ping messages (defaults to `true`).

## 2.18.1

### Patch Changes

- [#2530](https://github.com/wevm/viem/pull/2530) [`d6cc8f6b`](https://github.com/wevm/viem/commit/d6cc8f6bad61ca7f3bf04605de826530d23f1602) Thanks [@Si-Ki](https://github.com/Si-Ki)! - Added cronoszkEVMTestnet chain.

- [#2533](https://github.com/wevm/viem/pull/2533) [`a5d4ec4b`](https://github.com/wevm/viem/commit/a5d4ec4bdc73fc12a3078dc66eac884b41573a7a) Thanks [@jxom](https://github.com/jxom)! - Fixed support for filtering contract logs via its events on `abi` + `args`.

- [`62ff31dd`](https://github.com/wevm/viem/commit/62ff31dde0caaa96702187f42049cf8ea67e7cdd) Thanks [@tmm](https://github.com/tmm)! - Fixed missing import.

- [#2533](https://github.com/wevm/viem/pull/2533) [`a5d4ec4b`](https://github.com/wevm/viem/commit/a5d4ec4bdc73fc12a3078dc66eac884b41573a7a) Thanks [@jxom](https://github.com/jxom)! - Added `args` as a property to `parseEventLogs` to filter event logs by its arguments.

## 2.18.0

### Minor Changes

- [#2510](https://github.com/wevm/viem/pull/2510) [`070c0d1b`](https://github.com/wevm/viem/commit/070c0d1bd85ff3e77fdaf6b7f4ce4aee8d19c71a) Thanks [@jxom](https://github.com/jxom)! - Added an **ERC-4337 Account Abstraction** extension. [See Docs](https://viem.sh/account-abstraction).

## 2.17.11

### Patch Changes

- [`37d837cc`](https://github.com/wevm/viem/commit/37d837cc0bfccbeac7d8be5ffe25cb71c57ac764) Thanks [@tmm](https://github.com/tmm)! - Fixed internal type errors.

- [#2526](https://github.com/wevm/viem/pull/2526) [`e426cae2`](https://github.com/wevm/viem/commit/e426cae239a6bf8bb73ad4cd6861d23edbe07240) Thanks [@Si-Ki](https://github.com/Si-Ki)! - Added `bobaSepolia` chain.

## 2.17.10

### Patch Changes

- [#2513](https://github.com/wevm/viem/pull/2513) [`3af06fe`](https://github.com/wevm/viem/commit/3af06fe23dda1f44d43b3d3cec5d985894c2840a) Thanks [@hoangtan282](https://github.com/hoangtan282)! - Added Funki Mainnet.

- [#2519](https://github.com/wevm/viem/pull/2519) [`01cdac1`](https://github.com/wevm/viem/commit/01cdac14d508fbae50a31492e244b7adbe858bab) Thanks [@cbfyi](https://github.com/cbfyi)! - Added dispute game factory address for Base Sepolia.

- [#2515](https://github.com/wevm/viem/pull/2515) [`b7e4fa5`](https://github.com/wevm/viem/commit/b7e4fa518b1798741cf029f34ed3154695ab3a16) Thanks [@JoeyKhd](https://github.com/JoeyKhd)! - Added Root Network chain.

## 2.17.9

### Patch Changes

- [`b71e656e`](https://github.com/wevm/viem/commit/b71e656e08dadc44e2c1eccb5f505f70ce4d3aaf) Thanks [@jxom](https://github.com/jxom)! - Exported types required for inference.

## 2.17.8

### Patch Changes

- [`690cb9a7`](https://github.com/wevm/viem/commit/690cb9a78a801edf7ea3ab1d8cf1a0cd794fc32a) Thanks [@jxom](https://github.com/jxom)! - Exported types required for inference.

## 2.17.7

### Patch Changes

- [`7d3d505`](https://github.com/wevm/viem/commit/7d3d505221d4bb2ccc002be1cddc9e2011e33c01) Thanks [@jxom](https://github.com/jxom)! - Allow override of `Content-Type` header on `http` transport.

## 2.17.6

### Patch Changes

- [`aa42f47`](https://github.com/wevm/viem/commit/aa42f47fe8b5ce19858e5855ecdceae7000dbb92) Thanks [@jxom](https://github.com/jxom)! - Updated Darwinia chain explorer URL.

- [`759e34d`](https://github.com/wevm/viem/commit/759e34dde23ca50275d9e4df38805e8f0b285753) Thanks [@jxom](https://github.com/jxom)! - Enforced `r` and `s` hex values on `Signature` to be always padded to 32 bytes.

## 2.17.5

### Patch Changes

- [#2500](https://github.com/wevm/viem/pull/2500) [`f6d60054`](https://github.com/wevm/viem/commit/f6d60054bdcf8ada44c8af46b66eda50b05dd08b) Thanks [@lucadonnoh](https://github.com/lucadonnoh)! - Added OP Stack contract addresses for Mode Testnet chain.

## 2.17.4

### Patch Changes

- [#2493](https://github.com/wevm/viem/pull/2493) [`ef3601d`](https://github.com/wevm/viem/commit/ef3601d1db04e41c993943c0cfc72d3a64bbb6db) Thanks [@billalxcode](https://github.com/billalxcode)! - Added DreyerX Testnet chain

## 2.17.3

### Patch Changes

- [`ec3b0e0`](https://github.com/wevm/viem/commit/ec3b0e08f0a379249224e65092277191f1a8502b) Thanks [@jxom](https://github.com/jxom)! - Added fallback verification in `verifyHash`.

## 2.17.2

### Patch Changes

- [#2479](https://github.com/wevm/viem/pull/2479) [`5028b3f`](https://github.com/wevm/viem/commit/5028b3fb723100e49ca9b301405360b23c2a1003) Thanks [@keyding](https://github.com/keyding)! - Added Artela Testnet chain.

- [#2478](https://github.com/wevm/viem/pull/2478) [`795ca46`](https://github.com/wevm/viem/commit/795ca46cf93bc496abb23a5b868ea48bd80860ae) Thanks [@sj719045032](https://github.com/sj719045032)! - Added zkLink Nova Sepolia Testnet chain.

## 2.17.1

### Patch Changes

- [`f12dfdb9`](https://github.com/wevm/viem/commit/f12dfdb9fa15b68741d79972c97fb3fa99551c85) Thanks [@jxom](https://github.com/jxom)! - Fixed `watchContractEvent` querying for events against an invalid block range.

- [#2471](https://github.com/wevm/viem/pull/2471) [`f5ae57f9`](https://github.com/wevm/viem/commit/f5ae57f963cd8461f228c212dd1df7d9d99f6d47) Thanks [@michelebruno](https://github.com/michelebruno)! - Added multicall3 contract to Berachain bArtio.

- [#2476](https://github.com/wevm/viem/pull/2476) [`c5a33911`](https://github.com/wevm/viem/commit/c5a33911019219c11d96312293384dbbfa5bd452) Thanks [@sj719045032](https://github.com/sj719045032)! - Added zkLinkNova chain.

## 2.17.0

### Minor Changes

- [#2335](https://github.com/wevm/viem/pull/2335) [`3fce1c3`](https://github.com/wevm/viem/commit/3fce1c36414dfb4cd1b8df3f913fe1cc8abba7db) Thanks [@aaronmgdr](https://github.com/aaronmgdr)! - Added support for serializing and parsing OP deposit transactions on Celo.

### Patch Changes

- [#2459](https://github.com/wevm/viem/pull/2459) [`76092d8`](https://github.com/wevm/viem/commit/76092d851177edeeb6e801976fb9fc1afee94ee9) Thanks [@besated](https://github.com/besated)! - Added Sei testnet chain.

- [#2465](https://github.com/wevm/viem/pull/2465) [`32a71ab`](https://github.com/wevm/viem/commit/32a71ab2434a7cb53a59f6a5cc901a68ee78f362) Thanks [@giskook](https://github.com/giskook)! - Updated `xLayerTestnet` RPC URL.

- [#2447](https://github.com/wevm/viem/pull/2447) [`861d962`](https://github.com/wevm/viem/commit/861d962507cef076ceffa479ba74cd2fade0308c) Thanks [@jerray](https://github.com/jerray)! - Tweaked native currency property for `btr` and `btrTestnet` chains.

## 2.16.5

### Patch Changes

- [#2444](https://github.com/wevm/viem/pull/2444) [`495192c3`](https://github.com/wevm/viem/commit/495192c3811b608e70a566944290d75d36211d2e) Thanks [@RealWooblay](https://github.com/RealWooblay)! - Added XR Sepolia chain

- [#2451](https://github.com/wevm/viem/pull/2451) [`40f9a0f5`](https://github.com/wevm/viem/commit/40f9a0f5a63836c86322ddee9b0391dabd7b62b4) Thanks [@ChewySwap](https://github.com/ChewySwap)! - Added Dogechain multicall address.
  Added Puppynet Shibarium chain.

## 2.16.4

### Patch Changes

- [#2445](https://github.com/wevm/viem/pull/2445) [`8aa20a1`](https://github.com/wevm/viem/commit/8aa20a1ba293e714ce93dd948123168ecb838c14) Thanks [@radchukd](https://github.com/radchukd)! - Added lyra chain

- [`62b7a9d`](https://github.com/wevm/viem/commit/62b7a9d816e587142ae75753ff6e840ec49ebf0d) Thanks [@tmm](https://github.com/tmm)! - Bumped ABIType version

- [`7e95377`](https://github.com/wevm/viem/commit/7e95377ca26a87570aa16b6805f6cee58aeb9aef) Thanks [@jxom](https://github.com/jxom)! - Bumped dependencies:
  - `@noble/curves`: `1.2.0` → `1.4.0`
  - `@noble/hashes`: `1.3.2` → `1.4.0`
  - `@scure/bip32`: `1.3.2` → `1.4.0`
  - `@scure/bip39`: `1.2.1` → `1.3.0`

- [`95753c1`](https://github.com/wevm/viem/commit/95753c12ba34472dc747100303c2cf16d42b3e95) Thanks [@jxom](https://github.com/jxom)! - Added `cause` in `HttpRequestError`.

## 2.16.3

### Patch Changes

- [#2436](https://github.com/wevm/viem/pull/2436) [`2357376f`](https://github.com/wevm/viem/commit/2357376fa5c69c28a032bda95cf2f87bb3dac65f) Thanks [@RedHorse823](https://github.com/RedHorse823)! - Added Morph Holeksy Testnet chain.

- [#2439](https://github.com/wevm/viem/pull/2439) [`76f514c5`](https://github.com/wevm/viem/commit/76f514c5856f7bb1bb329f7e7c69521ecd4596d7) Thanks [@mypeaceduck](https://github.com/mypeaceduck)! - Added multicall3 contract to BitTorrent chain.

- [#2441](https://github.com/wevm/viem/pull/2441) [`a70db740`](https://github.com/wevm/viem/commit/a70db740cff1306824c8d6ba6d220fb51cfd688a) Thanks [@jiggyBu](https://github.com/jiggyBu)! - Added real & unreal chains

- [#2440](https://github.com/wevm/viem/pull/2440) [`76447337`](https://github.com/wevm/viem/commit/76447337de60f272179b25374a75a422180f45cc) Thanks [@devon-n](https://github.com/devon-n)! - Added Etherlink Mainnet chain

## 2.16.2

### Patch Changes

- [#2354](https://github.com/wevm/viem/pull/2354) [`b8fc0dc`](https://github.com/wevm/viem/commit/b8fc0dc1369a39d871dca9adf6d0c9038275d3cb) Thanks [@oleksiivinogradov](https://github.com/oleksiivinogradov)! - Added dchain chain

- [`00b353b`](https://github.com/wevm/viem/commit/00b353bf0242de3a18297fcd2eac5e03dcec36be) Thanks [@jxom](https://github.com/jxom)! - **Experimental:** Updated `grantPermissions` to conform to latest spec changes.

## 2.16.1

### Patch Changes

- [`fa494359`](https://github.com/wevm/viem/commit/fa4943594b9f95a1562c44a48f6eff87dc56a560) Thanks [@jxom](https://github.com/jxom)! - Added `chainId` as a parameter to `eth_sendTransaction`.

- [#2429](https://github.com/wevm/viem/pull/2429) [`3781bbb8`](https://github.com/wevm/viem/commit/3781bbb8b3ee8de065a581c97410389b84f7e9c8) Thanks [@jxom](https://github.com/jxom)! - Fixed an issue where `getAction` would ignore nullish return values from a synchronous Client Action.

- [`ed5c70e0`](https://github.com/wevm/viem/commit/ed5c70e0c5f21e4e2f7eb0fd17afc66888d787d7) Thanks [@jxom](https://github.com/jxom)! - **Experimental:** Added Solady utilities:
  - `hashMessage`
  - `hashTypedData`
  - `wrapTypedDataSignature`

## 2.16.0

### Minor Changes

- [#2424](https://github.com/wevm/viem/pull/2424) [`4b929790`](https://github.com/wevm/viem/commit/4b9297901e925e3e469822d8fe722bbcefb376ed) Thanks [@jxom](https://github.com/jxom)! - Stabilized ERC-6492 utilities:
  - `isErc6492Signature`
  - `parseErc6492Signature`
  - `serializeErc6492Signature`

  These utilities are no longer experimental, and can be imported from the `viem` entrypoint.

### Patch Changes

- [`a2b2c523`](https://github.com/wevm/viem/commit/a2b2c523e49baec7d1e425e2d64f3f9cdbaaf83b) Thanks [@tmm](https://github.com/tmm)! - Bumped ABIType

- [#2427](https://github.com/wevm/viem/pull/2427) [`38dc6a03`](https://github.com/wevm/viem/commit/38dc6a037c6d6358b3bb620db4406b9bd39620be) Thanks [@Phillip-Kemper](https://github.com/Phillip-Kemper)! - Added Zircuit Testnet

- [#2413](https://github.com/wevm/viem/pull/2413) [`99ed745b`](https://github.com/wevm/viem/commit/99ed745ba28d912cdad86d6a1718968c8da4c7c0) Thanks [@jxom](https://github.com/jxom)! - **Experimental:** Added [Solady flavoured ERC-1271](https://github.com/Vectorized/solady/blob/678c9163550810b08f0ffb09624c9f7532392303/src/accounts/ERC1271.sol) `signMessage` & `signTypedData` for Smart Accounts that implement (or conform to) [Solady's `ERC1271.sol`](https://github.com/Vectorized/solady/blob/678c9163550810b08f0ffb09624c9f7532392303/src/accounts/ERC1271.sol#L110-L180).

- [#2426](https://github.com/wevm/viem/pull/2426) [`01086ad9`](https://github.com/wevm/viem/commit/01086ad924f2d15f076f1a27434df1d88e9d3323) Thanks [@EvanYan1024](https://github.com/EvanYan1024)! - Added multicall3 to zetachain mainnet and testnet

## 2.15.1

### Patch Changes

- [`d8e44f7`](https://github.com/wevm/viem/commit/d8e44f7df36cd405b00d76438e9100d82cdd5ed6) Thanks [@jxom](https://github.com/jxom)! - Bumped `ws` dependency.

## 2.15.0

### Minor Changes

- [#2418](https://github.com/wevm/viem/pull/2418) [`6c36745`](https://github.com/wevm/viem/commit/6c36745e2a7f1826d691cff1037504546ad4fed0) Thanks [@jxom](https://github.com/jxom)! - Added support for a Nonce Manager on Local Accounts via `nonceManager`.

### Patch Changes

- [#2419](https://github.com/wevm/viem/pull/2419) [`ec831b5`](https://github.com/wevm/viem/commit/ec831b52301312c5c985a2cac128536e2639922f) Thanks [@iosh](https://github.com/iosh)! - Updated Conflux eSpace RPC URL

- [#2418](https://github.com/wevm/viem/pull/2418) [`6c36745`](https://github.com/wevm/viem/commit/6c36745e2a7f1826d691cff1037504546ad4fed0) Thanks [@jxom](https://github.com/jxom)! - Implemented in-flight request deduplication for Transport JSON-RPC requests.

- [`a5c97c5`](https://github.com/wevm/viem/commit/a5c97c556f17895742c164295f62bad793139f42) Thanks [@jxom](https://github.com/jxom)! - Added `berachainTestnetbArtio` chain.

## 2.14.2

### Patch Changes

- [#2414](https://github.com/wevm/viem/pull/2414) [`3636c5c`](https://github.com/wevm/viem/commit/3636c5c6c099dba1910f1d215d019acc6e12f101) Thanks [@turtlemoji](https://github.com/turtlemoji)! - Added `l2OutputOracle`, `portal` and `l1StandardBridge` contracts to `mode` chain.

## 2.14.1

### Patch Changes

- [#2411](https://github.com/wevm/viem/pull/2411) [`2fc14e50`](https://github.com/wevm/viem/commit/2fc14e50df3d6796cd29add44d0467320cb06195) Thanks [@tmm](https://github.com/tmm)! - Deprecated `getBytecode` (use `getCode` instead).

- [#2408](https://github.com/wevm/viem/pull/2408) [`21cb684a`](https://github.com/wevm/viem/commit/21cb684a6e41fc65ac0f15c0ee08df296f2b1a15) Thanks [@jxom](https://github.com/jxom)! - Added `code` as a parameter to `call` + `readContract` – to enable [Deployless Calls via Bytecode](https://viem.sh/docs/actions/public/call#bytecode).

## 2.14.0

### Minor Changes

- [#2405](https://github.com/wevm/viem/pull/2405) [`fc8919f5`](https://github.com/wevm/viem/commit/fc8919f5e73f4859627c268cceede3f1a2d9c9c3) Thanks [@jxom](https://github.com/jxom)! - Added `factory` & `factoryData` parameters to `call` & `readContract` to enable [Deployless Calls](https://viem.sh/docs/actions/public/call#deployless-calls) (calling a function on a contract which has not been deployed) via a [Factory Contract](https://docs.alchemy.com/docs/create2-an-alternative-to-deriving-contract-addresses).

  This is particularly useful for the use case of calling functions on [ERC-4337 Smart Accounts](https://eips.ethereum.org/EIPS/eip-4337) that have not been deployed yet.

## 2.13.10

### Patch Changes

- [#2399](https://github.com/wevm/viem/pull/2399) [`a61a90c`](https://github.com/wevm/viem/commit/a61a90c077c02cee80c88256461d5a71a35dbc0f) Thanks [@jxom](https://github.com/jxom)! - Added `getEip712Domain` Action.

## 2.13.9

### Patch Changes

- [#2398](https://github.com/wevm/viem/pull/2398) [`f2695cf`](https://github.com/wevm/viem/commit/f2695cfb81a3bf954879ab2f14d1c55bad1175f1) Thanks [@jxom](https://github.com/jxom)! - Fixed an issue where zero `r` and `s` values were not being serialized correctly.

- [#2374](https://github.com/wevm/viem/pull/2374) [`a81965e`](https://github.com/wevm/viem/commit/a81965e0984a2d239df0d5e989e6b2119aa4c680) Thanks [@roninjin10](https://github.com/roninjin10)! - Updated `EncodeDeployDataParameters` type.

- [#2388](https://github.com/wevm/viem/pull/2388) [`895e7d1`](https://github.com/wevm/viem/commit/895e7d11a2df3d7aaf7e13476b1c893abb055aaa) Thanks [@bajpai244](https://github.com/bajpai244)! - Updated `kakarotSepolia` chain id.

- [#2393](https://github.com/wevm/viem/pull/2393) [`f624e23`](https://github.com/wevm/viem/commit/f624e23c3355585b5ee1b7f1f44d80b7ff0c7b2d) Thanks [@venticello](https://github.com/venticello)! - Added Xai and Xai testnet chains.

- [#2392](https://github.com/wevm/viem/pull/2392) [`b80ec49`](https://github.com/wevm/viem/commit/b80ec4924ccfd1e6bb81f7e688396e6a1321a222) Thanks [@Markcial](https://github.com/Markcial)! - Added `ham` chain.

- [#2380](https://github.com/wevm/viem/pull/2380) [`d2de3c6`](https://github.com/wevm/viem/commit/d2de3c6713e0a79412f3bfb4cbdc1c361f68a08c) Thanks [@roninjin10](https://github.com/roninjin10)! - Added `docsBaseUrl` to `BaseError`.

- [#2384](https://github.com/wevm/viem/pull/2384) [`674f65d`](https://github.com/wevm/viem/commit/674f65d0ed3a6e8fab1bdc8a254f89200fa658ee) Thanks [@Aastha9018](https://github.com/Aastha9018)! - Added Redbelly Testnet chain.

## 2.13.8

### Patch Changes

- [#2375](https://github.com/wevm/viem/pull/2375) [`1d329882`](https://github.com/wevm/viem/commit/1d329882c6b37e722260a40c2745b8f0baa56bf9) Thanks [@ezynda3](https://github.com/ezynda3)! - Added API URL to `sei` chain.

- [`5e082655`](https://github.com/wevm/viem/commit/5e082655859584ce7ee8f97fc5e8dca73a8a6b4e) Thanks [@jxom](https://github.com/jxom)! - Added `disputeGameFactory` contract to `optimism` chain.

## 2.13.7

### Patch Changes

- [#2366](https://github.com/wevm/viem/pull/2366) [`561b03a5`](https://github.com/wevm/viem/commit/561b03a53955894f49e96f4af080588ac39657a0) Thanks [@fullstackninja864](https://github.com/fullstackninja864)! - Updated `nativeCurrency` for `defichainEvmTestnet` and `defichainEvm`.

- [`a3a8b1b1`](https://github.com/wevm/viem/commit/a3a8b1b191466e77baeb7975f34f8ee4b3117a69) Thanks [@jxom](https://github.com/jxom)! - Exported `serializeTypedData`.

## 2.13.6

### Patch Changes

- [#2337](https://github.com/wevm/viem/pull/2337) [`8984eee7`](https://github.com/wevm/viem/commit/8984eee7f23d430070e42ac1f2645ced0e82faf8) Thanks [@jaeil-wiki](https://github.com/jaeil-wiki)! - Updated `createSiweMessage` `statement` construction to match ABNF Message Format.

- [#2351](https://github.com/wevm/viem/pull/2351) [`48e6d50c`](https://github.com/wevm/viem/commit/48e6d50cae738e55869758cb25c52b2244069f09) Thanks [@agsola](https://github.com/agsola)! - Fixed `createSiweMessage` domain check to be RFC 3986 compliant.

## 2.13.5

### Patch Changes

- [#2356](https://github.com/wevm/viem/pull/2356) [`e6678622b8be1d7b72abe2e1331d455fb4a9c11f`](https://github.com/wevm/viem/commit/e6678622b8be1d7b72abe2e1331d455fb4a9c11f) Thanks [@blascokoa](https://github.com/blascokoa)! - Added SatoshiVM chain

- [#2361](https://github.com/wevm/viem/pull/2361) [`05c166e5cb2f5745ac48ba482fac14f4890f5c83`](https://github.com/wevm/viem/commit/05c166e5cb2f5745ac48ba482fac14f4890f5c83) Thanks [@tirogen](https://github.com/tirogen)! - Added Bitkub chain.

- [`7aad10e2ed7d3ecf5a6c38cd326aa9ff8dead239`](https://github.com/wevm/viem/commit/7aad10e2ed7d3ecf5a6c38cd326aa9ff8dead239) Thanks [@jxom](https://github.com/jxom)! - Added optional chaining to error handling in `withTimeout`.

## 2.13.4

### Patch Changes

- [#2348](https://github.com/wevm/viem/pull/2348) [`6cb084dd56260b1d0116e9ff9dc354117d33049e`](https://github.com/wevm/viem/commit/6cb084dd56260b1d0116e9ff9dc354117d33049e) Thanks [@ClockRide](https://github.com/ClockRide)! - Added `testnet: true` to fantomTestnet.

- [#2350](https://github.com/wevm/viem/pull/2350) [`19f3db87bfaa113bb6a4156f45c35f0ffcc5df7e`](https://github.com/wevm/viem/commit/19f3db87bfaa113bb6a4156f45c35f0ffcc5df7e) Thanks [@ClockRide](https://github.com/ClockRide)! - Added `testnet: true` to `btrTestnet`.

- [#2349](https://github.com/wevm/viem/pull/2349) [`4bfe975955d72fcaea46bc9bb56f4a475c39afb1`](https://github.com/wevm/viem/commit/4bfe975955d72fcaea46bc9bb56f4a475c39afb1) Thanks [@abs3ntdev](https://github.com/abs3ntdev)! - Added sei chain

## 2.13.3

### Patch Changes

- [`b6fd573d72b7cc74efc8c4a4a79ff76073242240`](https://github.com/wevm/viem/commit/b6fd573d72b7cc74efc8c4a4a79ff76073242240) Thanks [@jxom](https://github.com/jxom)! - Added `getAction` to `writeContracts`.

- [#2336](https://github.com/wevm/viem/pull/2336) [`7cb40947c1186665c65535bb348fea901dde7f6a`](https://github.com/wevm/viem/commit/7cb40947c1186665c65535bb348fea901dde7f6a) Thanks [@Lycan-Chain](https://github.com/Lycan-Chain)! - Added Lycan chain.

## 2.13.2

### Patch Changes

- [#2328](https://github.com/wevm/viem/pull/2328) [`d946d55b8431b255c4cdc2d20e413f9064e7513a`](https://github.com/wevm/viem/commit/d946d55b8431b255c4cdc2d20e413f9064e7513a) Thanks [@tmm](https://github.com/tmm)! - Improved `.extend` performance with `publicActions` and other large types.

- [#2334](https://github.com/wevm/viem/pull/2334) [`d4f34cb7bd44ca596573fc0a84fafbc60f4ea42b`](https://github.com/wevm/viem/commit/d4f34cb7bd44ca596573fc0a84fafbc60f4ea42b) Thanks [@Migl992](https://github.com/Migl992)! - Updated Avalanche explorer URLs.

- [#2329](https://github.com/wevm/viem/pull/2329) [`db85cc6bc9b29349b1eb077ebb6ea2a248bb5794`](https://github.com/wevm/viem/commit/db85cc6bc9b29349b1eb077ebb6ea2a248bb5794) Thanks [@abs3ntdev](https://github.com/abs3ntdev)! - Exported `DecodeFunctionDataReturnType` type.

## 2.13.1

### Patch Changes

- [#2316](https://github.com/wevm/viem/pull/2316) [`c61219784aa823d1d2c060a3fb2ee88b3cc2c098`](https://github.com/wevm/viem/commit/c61219784aa823d1d2c060a3fb2ee88b3cc2c098) Thanks [@abs3ntdev](https://github.com/abs3ntdev)! - Added taiko mainnet

- [#2315](https://github.com/wevm/viem/pull/2315) [`4f15896031a5b2ec6f40b4a10508b85233d1a154`](https://github.com/wevm/viem/commit/4f15896031a5b2ec6f40b4a10508b85233d1a154) Thanks [@Pfed-prog](https://github.com/Pfed-prog)! - Added Redstone chain.

## 2.13.0

### Minor Changes

- [#2317](https://github.com/wevm/viem/pull/2317) [`3135a0cbd70cd168369fd2d478025d6192d2d852`](https://github.com/wevm/viem/commit/3135a0cbd70cd168369fd2d478025d6192d2d852) Thanks [@jxom](https://github.com/jxom)! - **Experimental:** Added ERC-7715 extension.

- [#2313](https://github.com/wevm/viem/pull/2313) [`175d0ae2345a36f7923b19676fc8adb5e820e262`](https://github.com/wevm/viem/commit/175d0ae2345a36f7923b19676fc8adb5e820e262) Thanks [@jxom](https://github.com/jxom)! - **Breaking (Experimental):** Removed EIP-3074 support.

## 2.12.5

### Patch Changes

- [`41b48d47eb326de497773ba73ea89be41f980add`](https://github.com/wevm/viem/commit/41b48d47eb326de497773ba73ea89be41f980add) Thanks [@tmm](https://github.com/tmm)! - Removed console log

## 2.12.4

### Patch Changes

- [`ddfce938e4760f60be54ee97802d819cc2b052d8`](https://github.com/wevm/viem/commit/ddfce938e4760f60be54ee97802d819cc2b052d8) Thanks [@jxom](https://github.com/jxom)! - Resolved issue where hex-like strings were incorrectly being lowercased in `signTypedData`.

## 2.12.3

### Patch Changes

- [#2305](https://github.com/wevm/viem/pull/2305) [`36da346561767c5aecccf09b36d3f7a9f99e6844`](https://github.com/wevm/viem/commit/36da346561767c5aecccf09b36d3f7a9f99e6844) Thanks [@JuoCode](https://github.com/JuoCode)! - Removed trailing slash from polygonAmoy explorer URL.

## 2.12.2

### Patch Changes

- [#2307](https://github.com/wevm/viem/pull/2307) [`15d40229ff4f0624f7edf11b9f37f9b0a135647f`](https://github.com/wevm/viem/commit/15d40229ff4f0624f7edf11b9f37f9b0a135647f) Thanks [@tmm](https://github.com/tmm)! - Fixed type inference for payable `value` property.

- [#2303](https://github.com/wevm/viem/pull/2303) [`271893feb0cf26a4fb1ad4a04a16e5186542fdce`](https://github.com/wevm/viem/commit/271893feb0cf26a4fb1ad4a04a16e5186542fdce) Thanks [@hbriese](https://github.com/hbriese)! - Fixed parsing SIWE message containing domain with port

## 2.12.1

### Patch Changes

- [#2299](https://github.com/wevm/viem/pull/2299) [`144d90e09231cdbb105c95b0b52332cd1a97bbbb`](https://github.com/wevm/viem/commit/144d90e09231cdbb105c95b0b52332cd1a97bbbb) Thanks [@tmm](https://github.com/tmm)! - Fixed `createSiweMessage` `domain` validation.

- [#2292](https://github.com/wevm/viem/pull/2292) [`176a9e7bae90285401878cfeb54c09a7f7d8881b`](https://github.com/wevm/viem/commit/176a9e7bae90285401878cfeb54c09a7f7d8881b) Thanks [@nidz-the-fact](https://github.com/nidz-the-fact)! - Fixed `thaiChain` RPC URL.

- [#2298](https://github.com/wevm/viem/pull/2298) [`601cb741f7ba526c5441ab3fe6a485d283b85fd1`](https://github.com/wevm/viem/commit/601cb741f7ba526c5441ab3fe6a485d283b85fd1) Thanks [@tmm](https://github.com/tmm)! - Fixed support for ESM for 4337 trusted setups.

- [#2301](https://github.com/wevm/viem/pull/2301) [`36c55da99111714bfda5b55d5e855cc8c4a121d9`](https://github.com/wevm/viem/commit/36c55da99111714bfda5b55d5e855cc8c4a121d9) Thanks [@jxom](https://github.com/jxom)! - Fixed `isAddress` cache.

- [#2296](https://github.com/wevm/viem/pull/2296) [`efb77bf2dd201caad6d538767cd04790f42892a0`](https://github.com/wevm/viem/commit/efb77bf2dd201caad6d538767cd04790f42892a0) Thanks [@JackHamer09](https://github.com/JackHamer09)! - Added `native` explorers for zkSync and zkSync Sepolia Testnet chains.

## 2.12.0

### Minor Changes

- [`b06c56fd6ace6f6cadbeac6da359d650ff037cc1`](https://github.com/wevm/viem/commit/b06c56fd6ace6f6cadbeac6da359d650ff037cc1) Thanks [@tmm](https://github.com/tmm)! - Added Sign-In with Ethereum support.

### Patch Changes

- [#2290](https://github.com/wevm/viem/pull/2290) [`507533bbab2dc38a94de19e89950780fb9033fde`](https://github.com/wevm/viem/commit/507533bbab2dc38a94de19e89950780fb9033fde) Thanks [@tmm](https://github.com/tmm)! - Added L3X Protocol chain.

- [#2290](https://github.com/wevm/viem/pull/2290) [`507533bbab2dc38a94de19e89950780fb9033fde`](https://github.com/wevm/viem/commit/507533bbab2dc38a94de19e89950780fb9033fde) Thanks [@tmm](https://github.com/tmm)! - Added multilcall3 contract to Flow Previewnet.

- [#2290](https://github.com/wevm/viem/pull/2290) [`507533bbab2dc38a94de19e89950780fb9033fde`](https://github.com/wevm/viem/commit/507533bbab2dc38a94de19e89950780fb9033fde) Thanks [@tmm](https://github.com/tmm)! - Added thaiChain chain.

- [#2290](https://github.com/wevm/viem/pull/2290) [`507533bbab2dc38a94de19e89950780fb9033fde`](https://github.com/wevm/viem/commit/507533bbab2dc38a94de19e89950780fb9033fde) Thanks [@tmm](https://github.com/tmm)! - Updated Metis Explorer Definitions

## 2.11.1

### Patch Changes

- [`438ecffac0fd2ee3c1a774152efafa2a810fd5cf`](https://github.com/wevm/viem/commit/438ecffac0fd2ee3c1a774152efafa2a810fd5cf) Thanks [@jxom](https://github.com/jxom)! - Fixed hanging `waitForTransactionReceipt`

## 2.11.0

### Minor Changes

- [#2190](https://github.com/wevm/viem/pull/2190) [`698f922299755910bc031a4c0d4cc7bd6f6ef052`](https://github.com/wevm/viem/commit/698f922299755910bc031a4c0d4cc7bd6f6ef052) Thanks [@kiriyaga-txfusion](https://github.com/kiriyaga-txfusion)! - **zkSync Extension:** Added L1 Public Actions.

- [#2277](https://github.com/wevm/viem/pull/2277) [`5336e65c52d87edddc53164904ad3fb2ab25c026`](https://github.com/wevm/viem/commit/5336e65c52d87edddc53164904ad3fb2ab25c026) Thanks [@jxom](https://github.com/jxom)! - **Celo Extension (Breaking):** Removed CIP-42 support. Any transactions with a `feeCurrency` property will be treated as a CIP-64 transaction.

- [#2167](https://github.com/wevm/viem/pull/2167) [`c2c079143e065ac157a92c64c1aed58ee8435450`](https://github.com/wevm/viem/commit/c2c079143e065ac157a92c64c1aed58ee8435450) Thanks [@nikola-bozin-txfusion](https://github.com/nikola-bozin-txfusion)! - **zkSync Extension:** Added support for `zks_` namespace + actions.

## 2.10.11

### Patch Changes

- [#2275](https://github.com/wevm/viem/pull/2275) [`190268595d94d7d9ade07605754dcae6be3765cf`](https://github.com/wevm/viem/commit/190268595d94d7d9ade07605754dcae6be3765cf) Thanks [@jxom](https://github.com/jxom)! - Added `stateOverride` on `estimateGas`.

## 2.10.10

### Patch Changes

- [#2270](https://github.com/wevm/viem/pull/2270) [`601dbb436fcc855e3c2925baa9096bc841e28fef`](https://github.com/wevm/viem/commit/601dbb436fcc855e3c2925baa9096bc841e28fef) Thanks [@metallicusdev](https://github.com/metallicusdev)! - Added Metal L2 chain.

- [#2267](https://github.com/wevm/viem/pull/2267) [`7cf9c70bef8cf4543c930ab9a62fc547eb25a24e`](https://github.com/wevm/viem/commit/7cf9c70bef8cf4543c930ab9a62fc547eb25a24e) Thanks [@hoangtan282](https://github.com/hoangtan282)! - Add Funki Sepolia Testnet

- [#2272](https://github.com/wevm/viem/pull/2272) [`5de7e542c53471a44723d304f35212202f4f1c80`](https://github.com/wevm/viem/commit/5de7e542c53471a44723d304f35212202f4f1c80) Thanks [@abs3ntdev](https://github.com/abs3ntdev)! - Added Lisk mainnet

- [#2271](https://github.com/wevm/viem/pull/2271) [`b04fc38b0da655857477ac90517c72f4c58c5f65`](https://github.com/wevm/viem/commit/b04fc38b0da655857477ac90517c72f4c58c5f65) Thanks [@derrekcoleman](https://github.com/derrekcoleman)! - Added BOB chain.

## 2.10.9

### Patch Changes

- [#2254](https://github.com/wevm/viem/pull/2254) [`444978d9eef09348e94de55fd1f74eb2ad5f861c`](https://github.com/wevm/viem/commit/444978d9eef09348e94de55fd1f74eb2ad5f861c) Thanks [@aarifkhamdi](https://github.com/aarifkhamdi)! - Added Nautilus chain.

## 2.10.8

### Patch Changes

- [#2261](https://github.com/wevm/viem/pull/2261) [`8e337255dda6ce303ccfe556011b1071b7b74b1e`](https://github.com/wevm/viem/commit/8e337255dda6ce303ccfe556011b1071b7b74b1e) Thanks [@jnsdls](https://github.com/jnsdls)! - Updated `isows`.

## 2.10.7

### Patch Changes

- [#2256](https://github.com/wevm/viem/pull/2256) [`f9ffcf8413c06634bbcfe09517a57e75f784b969`](https://github.com/wevm/viem/commit/f9ffcf8413c06634bbcfe09517a57e75f784b969) Thanks [@LeTamanoir](https://github.com/LeTamanoir)! - Fixed batch scheduler id in http transport

- [#2257](https://github.com/wevm/viem/pull/2257) [`4382bb519b663fb678a519733f5c6c68d8f705c1`](https://github.com/wevm/viem/commit/4382bb519b663fb678a519733f5c6c68d8f705c1) Thanks [@jonathansmirnoff](https://github.com/jonathansmirnoff)! - Added Rootstock Testnet chain.

## 2.10.6

### Patch Changes

- [#2252](https://github.com/wevm/viem/pull/2252) [`35667f0644dac2450c217d2b4aa10b5ebb31d906`](https://github.com/wevm/viem/commit/35667f0644dac2450c217d2b4aa10b5ebb31d906) Thanks [@jsmjsm](https://github.com/jsmjsm)! - Added Bitlayer chain and Bitlayer Testnet chain.

## 2.10.5

### Patch Changes

- [`351a076a15725837429fb21f3aba62cf33c86fc9`](https://github.com/wevm/viem/commit/351a076a15725837429fb21f3aba62cf33c86fc9) Thanks [@jxom](https://github.com/jxom)! - Added note on EIP-1191 checksum.

- [#2241](https://github.com/wevm/viem/pull/2241) [`88c0226fc355b24a4a7b01eb572c98b7c4a686ec`](https://github.com/wevm/viem/commit/88c0226fc355b24a4a7b01eb572c98b7c4a686ec) Thanks [@nidz-the-fact](https://github.com/nidz-the-fact)! - Added jbcTestnet chain.

- [#2240](https://github.com/wevm/viem/pull/2240) [`50deaedcdf3c62ec121b48a87f43d59e072bf200`](https://github.com/wevm/viem/commit/50deaedcdf3c62ec121b48a87f43d59e072bf200) Thanks [@ezynda3](https://github.com/ezynda3)! - Updated Mantle block explorer.

- [`351a076a15725837429fb21f3aba62cf33c86fc9`](https://github.com/wevm/viem/commit/351a076a15725837429fb21f3aba62cf33c86fc9) Thanks [@jxom](https://github.com/jxom)! - Added LRU cache for `checksumAddress`.

## 2.10.4

### Patch Changes

- [#2231](https://github.com/wevm/viem/pull/2231) [`e097b26027393d46e1a00d3ace0b911ca6a47341`](https://github.com/wevm/viem/commit/e097b26027393d46e1a00d3ace0b911ca6a47341) Thanks [@pro-wh](https://github.com/pro-wh)! - Updated Sapphire and Sapphire Testnet chains.

## 2.10.3

### Patch Changes

- [`477ca530fa2f669614f0a65170cddfe4cb5b4dff`](https://github.com/wevm/viem/commit/477ca530fa2f669614f0a65170cddfe4cb5b4dff) Thanks [@tmm](https://github.com/tmm)! - Added `wallet_revokePermissions` to EIP-1193 types.

- [#2237](https://github.com/wevm/viem/pull/2237) [`eecb23060329f0b8958aacab77442cc3af6cb59e`](https://github.com/wevm/viem/commit/eecb23060329f0b8958aacab77442cc3af6cb59e) Thanks [@tmm](https://github.com/tmm)! - Added inEVM chain

## 2.10.2

### Patch Changes

- [#2227](https://github.com/wevm/viem/pull/2227) [`0f7541c04dfe637c8e2cc4153ac7c086985bf168`](https://github.com/wevm/viem/commit/0f7541c04dfe637c8e2cc4153ac7c086985bf168) Thanks [@jxom](https://github.com/jxom)! - Updated to latest `OptimismPortal2` contract.

- [`1a0731f6b888d59f74cfd2f62c001f780d0e6b2e`](https://github.com/wevm/viem/commit/1a0731f6b888d59f74cfd2f62c001f780d0e6b2e) Thanks [@jxom](https://github.com/jxom)! - Updated Otim Devnet `BatchInvoker` contract address.

- [#2221](https://github.com/wevm/viem/pull/2221) [`8d9731c0b65cb99d95d5f220c88be050513b0a66`](https://github.com/wevm/viem/commit/8d9731c0b65cb99d95d5f220c88be050513b0a66) Thanks [@ezynda3](https://github.com/ezynda3)! - Updated Celo explorer URL.

- [#2220](https://github.com/wevm/viem/pull/2220) [`302c355b5661e478d3f9c3c4ae42d9f2061d6d81`](https://github.com/wevm/viem/commit/302c355b5661e478d3f9c3c4ae42d9f2061d6d81) Thanks [@lbk3530](https://github.com/lbk3530)! - Added DODOchain testnet.

## 2.10.1

### Patch Changes

- [`6e28131a8b9ab53ad1330c61df64d3b7fb799652`](https://github.com/wevm/viem/commit/6e28131a8b9ab53ad1330c61df64d3b7fb799652) Thanks [@jxom](https://github.com/jxom)! - Fixed types for `wallet_sendCalls`.

## 2.10.0

### Minor Changes

- [#2209](https://github.com/wevm/viem/pull/2209) [`76a92bb97de9adede6d6d60c3aad2961d493045e`](https://github.com/wevm/viem/commit/76a92bb97de9adede6d6d60c3aad2961d493045e) Thanks [@wilsoncusack](https://github.com/wilsoncusack)! - **Experimental:** Added [ERC-6492](https://eips.ethereum.org/EIPS/eip-6492) signature utilities:
  - `isErc6492Signature`
  - `parseErc6492Signature`
  - `serializeErc6492Signature`

- [#2209](https://github.com/wevm/viem/pull/2209) [`76a92bb97de9adede6d6d60c3aad2961d493045e`](https://github.com/wevm/viem/commit/76a92bb97de9adede6d6d60c3aad2961d493045e) Thanks [@wilsoncusack](https://github.com/wilsoncusack)! - Deprecated utilities (will be removed in v3):
  - `hexToSignature` – use `parseSignature` instead.
  - `hexToCompactSignature` – use `parseCompactSignature` instead.
  - `compactSignatureToHex` – use `serializeCompactSignature` instead.
  - `signatureToHex` – use `serializeSignature` instead.

## 2.9.32

### Patch Changes

- [#2214](https://github.com/wevm/viem/pull/2214) [`a43649970aab6a8d4dcbe2912443cc2fbce1d1dd`](https://github.com/wevm/viem/commit/a43649970aab6a8d4dcbe2912443cc2fbce1d1dd) Thanks [@wottpal](https://github.com/wottpal)! - Exported ENS-related utility functions `packetToBytes` and `parseAvatarRecord`.`

## 2.9.31

### Patch Changes

- [`8a2fb73e06073af2f0cb3e21f4a964b59dc13ba2`](https://github.com/wevm/viem/commit/8a2fb73e06073af2f0cb3e21f4a964b59dc13ba2) Thanks [@jxom](https://github.com/jxom)! - **Experimental:** Fixed `getCapabilities` parameter type.

## 2.9.30

### Patch Changes

- [#2171](https://github.com/wevm/viem/pull/2171) [`6311259458f4f6aac550df8e4c862db5313c4428`](https://github.com/wevm/viem/commit/6311259458f4f6aac550df8e4c862db5313c4428) Thanks [@jxom](https://github.com/jxom)! - **Experimental:** Added EIP-3074 Invoker Instances API.

## 2.9.29

### Patch Changes

- [#2195](https://github.com/wevm/viem/pull/2195) [`79ec577f6108c3b9fecf98f1c2d579ad30659184`](https://github.com/wevm/viem/commit/79ec577f6108c3b9fecf98f1c2d579ad30659184) Thanks [@jxom](https://github.com/jxom)! - Fixed legacy transaction address recovery.

- [#2193](https://github.com/wevm/viem/pull/2193) [`5fe7494b8f34c304f9ad17297cfbb3a79e4e0f6a`](https://github.com/wevm/viem/commit/5fe7494b8f34c304f9ad17297cfbb3a79e4e0f6a) Thanks [@mlshv](https://github.com/mlshv)! - Fixed `fetchOptions` declaration on HTTP RPC.

- [#2196](https://github.com/wevm/viem/pull/2196) [`2ca18817ecbe069698924ed337f628ab6e52e397`](https://github.com/wevm/viem/commit/2ca18817ecbe069698924ed337f628ab6e52e397) Thanks [@PengDeng-Cyber](https://github.com/PengDeng-Cyber)! - Updated Cyber chain multicall address.

## 2.9.28

### Patch Changes

- [`e8c45db48277af8dfc7e3061482bcdc4b17679fb`](https://github.com/wevm/viem/commit/e8c45db48277af8dfc7e3061482bcdc4b17679fb) Thanks [@jxom](https://github.com/jxom)! - Tweaked imports and added `/*#__PURE__*/` annotations for better tree-shaking.

## 2.9.27

### Patch Changes

- [#2181](https://github.com/wevm/viem/pull/2181) [`0fcc91804893ec75c6f6888900ec58b3410c0180`](https://github.com/wevm/viem/commit/0fcc91804893ec75c6f6888900ec58b3410c0180) Thanks [@PengDeng-Cyber](https://github.com/PengDeng-Cyber)! - Removed `testnet` tag for Cyber Mainnet chain.

- [`5e8a249c3886a09a3a40b5748484fbf5d57f2fa6`](https://github.com/wevm/viem/commit/5e8a249c3886a09a3a40b5748484fbf5d57f2fa6) Thanks [@jxom](https://github.com/jxom)! - Added `Signature` as a valid input type to `signature` parameters.

- [`735726cac2f7136d8ce82ec5911fd8dde78a1339`](https://github.com/wevm/viem/commit/735726cac2f7136d8ce82ec5911fd8dde78a1339) Thanks [@jxom](https://github.com/jxom)! - Fixed `recoverTransactionAddress` for 4844 transactions.

- [#2172](https://github.com/wevm/viem/pull/2172) [`892f028204e1952500f132ac14f73cdc9ac99f81`](https://github.com/wevm/viem/commit/892f028204e1952500f132ac14f73cdc9ac99f81) Thanks [@aiiiden](https://github.com/aiiiden)! - Added yooldo verse chains.

## 2.9.26

### Patch Changes

- [#2180](https://github.com/wevm/viem/pull/2180) [`27bc03e886bed6e7d9e7e2cb19f5e8c64ed1ca29`](https://github.com/wevm/viem/commit/27bc03e886bed6e7d9e7e2cb19f5e8c64ed1ca29) Thanks [@PengDeng-Cyber](https://github.com/PengDeng-Cyber)! - Added Cyber Mainnet chain.

- [#2173](https://github.com/wevm/viem/pull/2173) [`7aa8ba3e0d49988d67cf542a7a2eebe4f9fbf9f7`](https://github.com/wevm/viem/commit/7aa8ba3e0d49988d67cf542a7a2eebe4f9fbf9f7) Thanks [@saeta-eth](https://github.com/saeta-eth)! - Updated Polygon Amoy explorer URL.

- [#2168](https://github.com/wevm/viem/pull/2168) [`1c550fa73cfdacfcd07201ef2224689bc03ee5da`](https://github.com/wevm/viem/commit/1c550fa73cfdacfcd07201ef2224689bc03ee5da) Thanks [@kiriyaga-txfusion](https://github.com/kiriyaga-txfusion)! - Fixed default fee values for zkSync eip712 transactions.

- [`cfff94c807c35a2b97e05e43aa4b464a6b5ceac5`](https://github.com/wevm/viem/commit/cfff94c807c35a2b97e05e43aa4b464a6b5ceac5) Thanks [@jxom](https://github.com/jxom)! - Added workaround to parse a raw text response into JSON if an RPC provider does not set `Content-Type: application/json` as a response header.

- [#2177](https://github.com/wevm/viem/pull/2177) [`ba856bab9a5651dde48eb3e73e0e04bc52f2d3bf`](https://github.com/wevm/viem/commit/ba856bab9a5651dde48eb3e73e0e04bc52f2d3bf) Thanks [@TheGreatAxios](https://github.com/TheGreatAxios)! - Fixed SKALE Crypto Colloseum Chain Id

## 2.9.25

### Patch Changes

- [`1593cac27556a83bf111529fc2bc799d9bb9db02`](https://github.com/wevm/viem/commit/1593cac27556a83bf111529fc2bc799d9bb9db02) Thanks [@jxom](https://github.com/jxom)! - Fixed `HasTransportType` type.

## 2.9.24

### Patch Changes

- [`0b0df527f7e8ff3fde8b15db93eae06653b8da86`](https://github.com/wevm/viem/commit/0b0df527f7e8ff3fde8b15db93eae06653b8da86) Thanks [@jxom](https://github.com/jxom)! - Fixed issue where fallback transports with a webSocket transport would not utilize `eth_subscribe` in watcher actions.

- [#2161](https://github.com/wevm/viem/pull/2161) [`601ed60d6c570bba0e88d9d26a322db4f8e605d6`](https://github.com/wevm/viem/commit/601ed60d6c570bba0e88d9d26a322db4f8e605d6) Thanks [@PengDeng-Cyber](https://github.com/PengDeng-Cyber)! - Added Cyber testnet.

## 2.9.23

### Patch Changes

- [#2153](https://github.com/wevm/viem/pull/2153) [`71a17c0a2abcd81963e23cb76a3e8a792abbd7b6`](https://github.com/wevm/viem/commit/71a17c0a2abcd81963e23cb76a3e8a792abbd7b6) Thanks [@billalxcode](https://github.com/billalxcode)! - Added DreyerX Mainnet chain.

- [#2155](https://github.com/wevm/viem/pull/2155) [`803fa0de429942b800172f87c93c41fa69f9c030`](https://github.com/wevm/viem/commit/803fa0de429942b800172f87c93c41fa69f9c030) Thanks [@jxom](https://github.com/jxom)! - Added experimental 3074 utilties:
  - `signAuthMessage`
  - `recoverAuthMessageAddress`
  - `verifyAuthMessage`

## 2.9.22

### Patch Changes

- [`e5121a3055233a7cda8a46435bcdee674f1b1313`](https://github.com/wevm/viem/commit/e5121a3055233a7cda8a46435bcdee674f1b1313) Thanks [@jxom](https://github.com/jxom)! - Fixed `getContract` function generics.

## 2.9.21

### Patch Changes

- [#2144](https://github.com/wevm/viem/pull/2144) [`424e583e20c4754dffdff61f533133d8b674024f`](https://github.com/wevm/viem/commit/424e583e20c4754dffdff61f533133d8b674024f) Thanks [@bthaile](https://github.com/bthaile)! - Added Flow testnet.

- [#2142](https://github.com/wevm/viem/pull/2142) [`c4047dc5b7cd85bf86694dcde46105ee28433f43`](https://github.com/wevm/viem/commit/c4047dc5b7cd85bf86694dcde46105ee28433f43) Thanks [@UncleBill](https://github.com/UncleBill)! - Added X Layer chain.

## 2.9.20

### Patch Changes

- [#2140](https://github.com/wevm/viem/pull/2140) [`461f99755889239f2c59b5e88baf9b81c60be49f`](https://github.com/wevm/viem/commit/461f99755889239f2c59b5e88baf9b81c60be49f) Thanks [@therealdannzor](https://github.com/therealdannzor)! - Added PlayFi Albireo chain.

- [`7d96364f3426adae99f66dad9203c7d6007b3122`](https://github.com/wevm/viem/commit/7d96364f3426adae99f66dad9203c7d6007b3122) Thanks [@jxom](https://github.com/jxom)! - Exported types required for inference.

## 2.9.19

### Patch Changes

- [#2139](https://github.com/wevm/viem/pull/2139) [`ee55a4e3ba632476d3249a7f85f687f6ff5110cb`](https://github.com/wevm/viem/commit/ee55a4e3ba632476d3249a7f85f687f6ff5110cb) Thanks [@michecode](https://github.com/michecode)! - Added Mantle Sepolia chain.

- [`581dc93fb5216ee910ac741af617f0c45edf582b`](https://github.com/wevm/viem/commit/581dc93fb5216ee910ac741af617f0c45edf582b) Thanks [@jxom](https://github.com/jxom)! - Fixed issue where a request `dispatcher` wasn't being propagated to `fetch`.

## 2.9.18

### Patch Changes

- [`2158c1d76b7d1a18936c8718faf987a35ea2a14f`](https://github.com/wevm/viem/commit/2158c1d76b7d1a18936c8718faf987a35ea2a14f) Thanks [@jxom](https://github.com/jxom)! - Added ability to override `RpcSchema` type on Client.

- [#2135](https://github.com/wevm/viem/pull/2135) [`f722ff7e207f64cd75c25a512fda31117e8d934e`](https://github.com/wevm/viem/commit/f722ff7e207f64cd75c25a512fda31117e8d934e) Thanks [@hamidroohi71](https://github.com/hamidroohi71)! - Added Darwinia chain

## 2.9.17

### Patch Changes

- [#2128](https://github.com/wevm/viem/pull/2128) [`90fdf8cb7e8dc66552a978061f59e7932b980d1b`](https://github.com/wevm/viem/commit/90fdf8cb7e8dc66552a978061f59e7932b980d1b) Thanks [@ezynda3](https://github.com/ezynda3)! - Updated Mode block explorer URL.

- [#2122](https://github.com/wevm/viem/pull/2122) [`f020b48b6107855e62d09c2e3768f348c4c3af28`](https://github.com/wevm/viem/commit/f020b48b6107855e62d09c2e3768f348c4c3af28) Thanks [@abs3ntdev](https://github.com/abs3ntdev)! - Updated Boba native currency from BOBA to ETH.

- [#2119](https://github.com/wevm/viem/pull/2119) [`4db7c996ee68f7d3fdeeac1227655692a3febb13`](https://github.com/wevm/viem/commit/4db7c996ee68f7d3fdeeac1227655692a3febb13) Thanks [@Imti](https://github.com/Imti)! - Updated Publicnode RPC URLs to new format.

- [#2124](https://github.com/wevm/viem/pull/2124) [`d2f93e726df1ab1ff86098d68a4406f6fae315b8`](https://github.com/wevm/viem/commit/d2f93e726df1ab1ff86098d68a4406f6fae315b8) Thanks [@ITZSHOAIB](https://github.com/ITZSHOAIB)! - Exported EON chain.

- [#2132](https://github.com/wevm/viem/pull/2132) [`8c3eb6a5c13f550dfde4fee6edd1e898bebf9f2e`](https://github.com/wevm/viem/commit/8c3eb6a5c13f550dfde4fee6edd1e898bebf9f2e) Thanks [@acedward](https://github.com/acedward)! - Fixed `getAction` for cases where the bundler could change function names.

- [#2129](https://github.com/wevm/viem/pull/2129) [`d8345478fb469f43745e35e1e645f5d4c9ee40e8`](https://github.com/wevm/viem/commit/d8345478fb469f43745e35e1e645f5d4c9ee40e8) Thanks [@hungdoansy](https://github.com/hungdoansy)! - Added Manta Pacific Sepolia Testnet chain.

## 2.9.16

### Patch Changes

- [#2108](https://github.com/wevm/viem/pull/2108) [`b22a928ee699e7b441d590b388f28d2c3abba639`](https://github.com/wevm/viem/commit/b22a928ee699e7b441d590b388f28d2c3abba639) Thanks [@Gary20001016](https://github.com/Gary20001016)! - Added BEVM Mainnet

- [#2111](https://github.com/wevm/viem/pull/2111) [`6d37191e877c24ef25226d2233acd4d8afa1c529`](https://github.com/wevm/viem/commit/6d37191e877c24ef25226d2233acd4d8afa1c529) Thanks [@edgeless-network](https://github.com/edgeless-network)! - Added Edgeless Network and Edgeless Testnet.

## 2.9.15

### Patch Changes

- [#2020](https://github.com/wevm/viem/pull/2020) [`f1e7d1e20d10fb5210a63ce27b79ea2b521e5eb5`](https://github.com/wevm/viem/commit/f1e7d1e20d10fb5210a63ce27b79ea2b521e5eb5) Thanks [@PierreOssun](https://github.com/PierreOssun)! - Removed defunkt zKatana chain & updated multicall address on Astar zkEVM mainnet

## 2.9.14

### Patch Changes

- [#2100](https://github.com/wevm/viem/pull/2100) [`d40bb40f8a027213d47d0a9eb385c164a4d4d811`](https://github.com/wevm/viem/commit/d40bb40f8a027213d47d0a9eb385c164a4d4d811) Thanks [@biga816](https://github.com/biga816)! - Added `testnet` properties to Filecoin definitions

- [#2097](https://github.com/wevm/viem/pull/2097) [`1c935f19a4ed852e8c7ddd1e62ff04c712c5fba5`](https://github.com/wevm/viem/commit/1c935f19a4ed852e8c7ddd1e62ff04c712c5fba5) Thanks [@jxom](https://github.com/jxom)! - Added `blobVersionedHashes` & `sidecars` support to `prepareTransactionRequest`.

## 2.9.13

### Patch Changes

- [#2092](https://github.com/wevm/viem/pull/2092) [`25cd1a2d97f83de2a3a8a1eaa34e772cff13e2b6`](https://github.com/wevm/viem/commit/25cd1a2d97f83de2a3a8a1eaa34e772cff13e2b6) Thanks [@ITZSHOAIB](https://github.com/ITZSHOAIB)! - Fixed decoding of event logs when an event argument was missing a name.

- [#2082](https://github.com/wevm/viem/pull/2082) [`39ccad8988b54f7cc25ad68a3170d03ec5a0fd3e`](https://github.com/wevm/viem/commit/39ccad8988b54f7cc25ad68a3170d03ec5a0fd3e) Thanks [@maxencerb](https://github.com/maxencerb)! - Added `fromBlock` parameter to `watchEvent` and `watchContractEvent`.

## 2.9.12

### Patch Changes

- [#2073](https://github.com/wevm/viem/pull/2073) [`212eab2c5514444441fe298584a0d9b35c7cdee7`](https://github.com/wevm/viem/commit/212eab2c5514444441fe298584a0d9b35c7cdee7) Thanks [@jxom](https://github.com/jxom)! - Added reconnect functionality to `webSocket` & `ipc` transports.

## 2.9.11

### Patch Changes

- [#2086](https://github.com/wevm/viem/pull/2086) [`2dfa6172279543b67bc616cf1f5e2ec35a19c0a6`](https://github.com/wevm/viem/commit/2dfa6172279543b67bc616cf1f5e2ec35a19c0a6) Thanks [@jxom](https://github.com/jxom)! - **Experimental:** Added `showCallsStatus`
  **Experimental:** Renamed `getCallsReceipt` to `getCallsStatus`
  **Experimental:** `getCapabilities` now requires an account.

- [#2088](https://github.com/wevm/viem/pull/2088) [`e8531a8454dd7368bf3ad963a7902e57d1f560ce`](https://github.com/wevm/viem/commit/e8531a8454dd7368bf3ad963a7902e57d1f560ce) Thanks [@Destiner](https://github.com/Destiner)! - Added multicall3 to Polygon Amoy chain

## 2.9.10

### Patch Changes

- [#2071](https://github.com/wevm/viem/pull/2071) [`f257ac296c60dec31ae7d4fb551f7d04f990ff9f`](https://github.com/wevm/viem/commit/f257ac296c60dec31ae7d4fb551f7d04f990ff9f) Thanks [@0xArdy](https://github.com/0xArdy)! - Added sourceId to Mode network

- [#2074](https://github.com/wevm/viem/pull/2074) [`1361adfbeadfb72cf3e4406a81479b0f00df00de`](https://github.com/wevm/viem/commit/1361adfbeadfb72cf3e4406a81479b0f00df00de) Thanks [@Destiner](https://github.com/Destiner)! - Added Polygon zkEVM Cardona chain
  Deprecated Polygon zkEVM testnet chain

- [#2079](https://github.com/wevm/viem/pull/2079) [`c78c3ff026ff3292463953e115044b266b1111b4`](https://github.com/wevm/viem/commit/c78c3ff026ff3292463953e115044b266b1111b4) Thanks [@abtestingalpha](https://github.com/abtestingalpha)! - Added multicall3 contract to dfk definition

## 2.9.9

### Patch Changes

- [`8a8fab2ace50a9d31df5d990ae6603c210a67860`](https://github.com/wevm/viem/commit/8a8fab2ace50a9d31df5d990ae6603c210a67860) Thanks [@jxom](https://github.com/jxom)! - Fixed parsing of `stateOverrides`.

- [`03095724427a0662694801392d38d6a7b5dd43c7`](https://github.com/wevm/viem/commit/03095724427a0662694801392d38d6a7b5dd43c7) Thanks [@jxom](https://github.com/jxom)! - (Experimental) Renamed `getCallsStatus` to `getCallsStatus`

- [#2056](https://github.com/wevm/viem/pull/2056) [`368d8e6526fa32b4d153e78440b428ebcd577c15`](https://github.com/wevm/viem/commit/368d8e6526fa32b4d153e78440b428ebcd577c15) Thanks [@VGau](https://github.com/VGau)! - Added Linea Sepolia chain.
  Updated Linea Goerli export name.

- [#2063](https://github.com/wevm/viem/pull/2063) [`f539b0d71c590069872f31e62497570081cea144`](https://github.com/wevm/viem/commit/f539b0d71c590069872f31e62497570081cea144) Thanks [@jxom](https://github.com/jxom)! - Fixed issue where the `transactionRequest` formatter would supply redundant properties.

## 2.9.8

### Patch Changes

- [`ad15cc2998305fc162698d9bb3147933e7b4e764`](https://github.com/wevm/viem/commit/ad15cc2998305fc162698d9bb3147933e7b4e764) Thanks [@jxom](https://github.com/jxom)! - Added support for experimental `writeContracts`.

## 2.9.7

### Patch Changes

- [#2053](https://github.com/wevm/viem/pull/2053) [`e53fe120b9c15dde3e50eda794e261f320bf52bc`](https://github.com/wevm/viem/commit/e53fe120b9c15dde3e50eda794e261f320bf52bc) Thanks [@jxom](https://github.com/jxom)! - Added experimental support for [EIP-5792 `wallet_` methods](https://github.com/ethereum/EIPs/blob/815028dc634463e1716fc5ce44c019a6040f0bef/EIPS/eip-5792.md).

- [#2052](https://github.com/wevm/viem/pull/2052) [`445ec244c7be329eb26048102d282bac9bf23506`](https://github.com/wevm/viem/commit/445ec244c7be329eb26048102d282bac9bf23506) Thanks [@maggo](https://github.com/maggo)! - Added WebSocket RPC URL on Degen chain.

- [#2054](https://github.com/wevm/viem/pull/2054) [`49219f080ce404d4cd0edc5d4abe2947a3b8cc40`](https://github.com/wevm/viem/commit/49219f080ce404d4cd0edc5d4abe2947a3b8cc40) Thanks [@nikola-bozin-txfusion](https://github.com/nikola-bozin-txfusion)! - Updated zkSync development chains with zkSync `chainConfig`.

## 2.9.6

### Patch Changes

- [#2048](https://github.com/wevm/viem/pull/2048) [`85c3695ec917918da7ae62697ce757ade2fdb8c6`](https://github.com/wevm/viem/commit/85c3695ec917918da7ae62697ce757ade2fdb8c6) Thanks [@tmm](https://github.com/tmm)! - Added `onFetchRequest` to `http` transport.

- [#2041](https://github.com/wevm/viem/pull/2041) [`29eea54b37aeaebad62296ef12e0786b598b6fdf`](https://github.com/wevm/viem/commit/29eea54b37aeaebad62296ef12e0786b598b6fdf) Thanks [@shazarre](https://github.com/shazarre)! - Added custom Celo fees estimation function for cases when feeCurrency is used to send a transaction.

- [#2050](https://github.com/wevm/viem/pull/2050) [`dd0ed3efb25305d70b67a19cc13ac5ccf1d1cd64`](https://github.com/wevm/viem/commit/dd0ed3efb25305d70b67a19cc13ac5ccf1d1cd64) Thanks [@cryptoflop](https://github.com/cryptoflop)! - Added Degen chain.

- [#2051](https://github.com/wevm/viem/pull/2051) [`15be6eaf21c3dddc4894220e409e4c5126c6f015`](https://github.com/wevm/viem/commit/15be6eaf21c3dddc4894220e409e4c5126c6f015) Thanks [@jxom](https://github.com/jxom)! - Fixed regression where `getAddress` threw an error for non-checksum addresses instead of converting to a valid checksum address.

## 2.9.5

### Patch Changes

- [#2036](https://github.com/wevm/viem/pull/2036) [`b5acc5b7bb97b2f6702d5ea0ef280bb158eb94f4`](https://github.com/wevm/viem/commit/b5acc5b7bb97b2f6702d5ea0ef280bb158eb94f4) Thanks [@dalechyn](https://github.com/dalechyn)! - Fixed overloaded function return types.

- [#2035](https://github.com/wevm/viem/pull/2035) [`46baadcff3663a20b4de4494cdd22a5b7dc21cbd`](https://github.com/wevm/viem/commit/46baadcff3663a20b4de4494cdd22a5b7dc21cbd) Thanks [@Fiddlekins](https://github.com/Fiddlekins)! - Added Sei Devnet chain.

## 2.9.4

### Patch Changes

- [#2024](https://github.com/wevm/viem/pull/2024) [`cc0142476b805ab0983b296bf129c4db04ee6c4e`](https://github.com/wevm/viem/commit/cc0142476b805ab0983b296bf129c4db04ee6c4e) Thanks [@Azleal](https://github.com/Azleal)! - Updated `zetachainAthensTestnet` Explorer URL.

- [`63feaeadef67915b2029911919d966634942f744`](https://github.com/wevm/viem/commit/63feaeadef67915b2029911919d966634942f744) Thanks [@jxom](https://github.com/jxom)! - Updated `plumeTestnet` RPC URLs.

## 2.9.3

### Patch Changes

- [#2018](https://github.com/wevm/viem/pull/2018) [`1fae8174b6dfd26a4bf908004bca93cf24a16261`](https://github.com/wevm/viem/commit/1fae8174b6dfd26a4bf908004bca93cf24a16261) Thanks [@saeta-eth](https://github.com/saeta-eth)! - Updated Polygon Mumbai Etherscan API URL.

- [#2019](https://github.com/wevm/viem/pull/2019) [`81ddc5ec9953fc46a25d72991ca63a75cb8de27d`](https://github.com/wevm/viem/commit/81ddc5ec9953fc46a25d72991ca63a75cb8de27d) Thanks [@youPickItUp](https://github.com/youPickItUp)! - Added `blockTag` to `observerId` in `watchBlocks` to avoid id collisions.

- [#2015](https://github.com/wevm/viem/pull/2015) [`b3b989fac1c42a9e1fa870610010150b94297d1f`](https://github.com/wevm/viem/commit/b3b989fac1c42a9e1fa870610010150b94297d1f) Thanks [@emrahsky](https://github.com/emrahsky)! - Added Areon chain.

- [#2021](https://github.com/wevm/viem/pull/2021) [`8a173ccd302b267a5165778061e262755ace401f`](https://github.com/wevm/viem/commit/8a173ccd302b267a5165778061e262755ace401f) Thanks [@jxom](https://github.com/jxom)! - Minimized redundant requests in `prepareTransactionRequest` (addressed #2017).

## 2.9.2

### Patch Changes

- [#2006](https://github.com/wevm/viem/pull/2006) [`742d4db0e4388a211cdfe483bdbfb9f40218fe17`](https://github.com/wevm/viem/commit/742d4db0e4388a211cdfe483bdbfb9f40218fe17) Thanks [@TateB](https://github.com/TateB)! - Added ability to specify a custom offchain lookup request for CCIP Read, and ability to disable CCIP Read entirely.

## 2.9.1

### Patch Changes

- [#2009](https://github.com/wevm/viem/pull/2009) [`69017a9b7bab8b5a3bd9d9f2306c889ddd6ca728`](https://github.com/wevm/viem/commit/69017a9b7bab8b5a3bd9d9f2306c889ddd6ca728) Thanks [@avniculae](https://github.com/avniculae)! - Added Reya Network chain.

- [#2008](https://github.com/wevm/viem/pull/2008) [`cb0ea880057252684a5540f9282fc1982ef8fb86`](https://github.com/wevm/viem/commit/cb0ea880057252684a5540f9282fc1982ef8fb86) Thanks [@ezynda3](https://github.com/ezynda3)! - Added API URLs to Blast chains.

## 2.9.0

### Minor Changes

- [#1907](https://github.com/wevm/viem/pull/1907) [`b40210f7308eb73a857692552381e06727511706`](https://github.com/wevm/viem/commit/b40210f7308eb73a857692552381e06727511706) Thanks [@mpopovac-txfusion](https://github.com/mpopovac-txfusion)! - Added `deployContract` Action to zkSync Extensions.

- [#1994](https://github.com/wevm/viem/pull/1994) [`119aea616be0d1db06716709a64e8ab1966c7d4f`](https://github.com/wevm/viem/commit/119aea616be0d1db06716709a64e8ab1966c7d4f) Thanks [@jxom](https://github.com/jxom)! - Added support for [Fault Proofs on OP Stack](https://docs.optimism.io/stack/protocol/fault-proofs/overview), and new actions:
  - [`getGame`](https://viem.sh/op-stack/actions/getGame) (supersedes `getL2Output`)
  - `getGames`
  - [`getTimeToNextGame`](https://viem.sh/op-stack/actions/getTimeToNextGame) (supersedes `getTimeToNextL2Output`)
  - [`waitForNextGame`](https://viem.sh/op-stack/actions/waitForNextGame) (supersedes `waitForNextL2Output`)

  > Note: The above actions are only compatible with OP Stack chains which have upgraded to Fault Proofs.

## 2.8.18

### Patch Changes

- [`32b44e0ce41081474a6a5a91716d64edcbfda217`](https://github.com/wevm/viem/commit/32b44e0ce41081474a6a5a91716d64edcbfda217) Thanks [@jxom](https://github.com/jxom)! - Exported types required for inference.

## 2.8.17

### Patch Changes

- [#1952](https://github.com/wevm/viem/pull/1952) [`3d6109a6faf92090c6500534aebf657332335f30`](https://github.com/wevm/viem/commit/3d6109a6faf92090c6500534aebf657332335f30) Thanks [@RobbyUitbeijerse](https://github.com/RobbyUitbeijerse)! - Added Immutable zkEVM (mainnet & testnet) chains.

- [#1995](https://github.com/wevm/viem/pull/1995) [`0cf41702578f90cb7e6328d3ee069fd61a41c2f5`](https://github.com/wevm/viem/commit/0cf41702578f90cb7e6328d3ee069fd61a41c2f5) Thanks [@jxom](https://github.com/jxom)! - Updated `blobs` limit to 6.

- [#1973](https://github.com/wevm/viem/pull/1973) [`b2949d39ec2428775a1b5ec61dccc0b2ca0c7691`](https://github.com/wevm/viem/commit/b2949d39ec2428775a1b5ec61dccc0b2ca0c7691) Thanks [@Resister-boy](https://github.com/Resister-boy)! - Updated Sepolia ether symbol.

## 2.8.16

### Patch Changes

- [`26d6dc54117a1a0f57bb18098a64fb98692cfdda`](https://github.com/wevm/viem/commit/26d6dc54117a1a0f57bb18098a64fb98692cfdda) Thanks [@jxom](https://github.com/jxom)! - Fixed early termination in `fromBlobs`.

## 2.8.15

### Patch Changes

- [#1984](https://github.com/wevm/viem/pull/1984) [`843a0e114445da084333f0df0dedf1f325190f3d`](https://github.com/wevm/viem/commit/843a0e114445da084333f0df0dedf1f325190f3d) Thanks [@Confucian-e](https://github.com/Confucian-e)! - Exported `AbiEvent`.

## 2.8.14

### Patch Changes

- [#1981](https://github.com/wevm/viem/pull/1981) [`86b75c4f4d526698f2308145c10a7052cec5b03f`](https://github.com/wevm/viem/commit/86b75c4f4d526698f2308145c10a7052cec5b03f) Thanks [@jxom](https://github.com/jxom)! - Added `prepareEncodeFunctionData`.

## 2.8.13

### Patch Changes

- [#1977](https://github.com/wevm/viem/pull/1977) [`ffacb1b6592604d4915a88c15ebd63357586f592`](https://github.com/wevm/viem/commit/ffacb1b6592604d4915a88c15ebd63357586f592) Thanks [@jxom](https://github.com/jxom)! - Added `recoverTransactionAddress`.

## 2.8.12

### Patch Changes

- [`341fcece33060fa8304db89d0e205e8176100318`](https://github.com/wevm/viem/commit/341fcece33060fa8304db89d0e205e8176100318) Thanks [@jxom](https://github.com/jxom)! - Exported types for inference.

- [#1971](https://github.com/wevm/viem/pull/1971) [`671747de78db010f4f0c4037663ccd0dd5f17d50`](https://github.com/wevm/viem/commit/671747de78db010f4f0c4037663ccd0dd5f17d50) Thanks [@lezzokafka](https://github.com/lezzokafka)! - Updated Chronos explorer URL.

## 2.8.11

### Patch Changes

- [#1864](https://github.com/wevm/viem/pull/1864) [`1bf9352b51069d2820de6b10940b0a656ada5edf`](https://github.com/wevm/viem/commit/1bf9352b51069d2820de6b10940b0a656ada5edf) Thanks [@nikola-bozin-txfusion](https://github.com/nikola-bozin-txfusion)! - Added Zksync InMemory node and Local Node chains

- [`a4782bb34924bb30e25d07a7efccb4067110b502`](https://github.com/wevm/viem/commit/a4782bb34924bb30e25d07a7efccb4067110b502) Thanks [@jxom](https://github.com/jxom)! - Fixed `eth_unsubscribe` not being called for watch action teardown.

- [#1969](https://github.com/wevm/viem/pull/1969) [`b6f591633697008d90a0fafa34873076982a5d61`](https://github.com/wevm/viem/commit/b6f591633697008d90a0fafa34873076982a5d61) Thanks [@jxom](https://github.com/jxom)! - Support `exactOptionalPropertyTypes`.

- [#1966](https://github.com/wevm/viem/pull/1966) [`a215b6fffa81033be9ad705b53360f445630b595`](https://github.com/wevm/viem/commit/a215b6fffa81033be9ad705b53360f445630b595) Thanks [@YamenMerhi](https://github.com/YamenMerhi)! - Added LUKSO Testnet

## 2.8.10

### Patch Changes

- [#1956](https://github.com/wevm/viem/pull/1956) [`bb7a066a96c6d25baba3fb0e8026f31696592a1e`](https://github.com/wevm/viem/commit/bb7a066a96c6d25baba3fb0e8026f31696592a1e) Thanks [@ezynda3](https://github.com/ezynda3)! - Updated Arbitrum Sepolia API URL.

- [`4d52c74d318daf4eebb0dae43f581aa20ef62118`](https://github.com/wevm/viem/commit/4d52c74d318daf4eebb0dae43f581aa20ef62118) Thanks [@jxom](https://github.com/jxom)! - Fixed boolean conversion issue.

## 2.8.9

### Patch Changes

- [#1953](https://github.com/wevm/viem/pull/1953) [`185e2bbdde7115779900ff3ad9178e3a7ec0cc64`](https://github.com/wevm/viem/commit/185e2bbdde7115779900ff3ad9178e3a7ec0cc64) Thanks [@SergeevDmitry](https://github.com/SergeevDmitry)! - Added Stratis chain.

## 2.8.8

### Patch Changes

- [#1950](https://github.com/wevm/viem/pull/1950) [`73653824541e60240d644eee0fbfe83e0bed817d`](https://github.com/wevm/viem/commit/73653824541e60240d644eee0fbfe83e0bed817d) Thanks [@RobbyUitbeijerse](https://github.com/RobbyUitbeijerse)! - Added Beam Websocket RPC URLs.

## 2.8.7

### Patch Changes

- [`b3c73b94f0e589da6217c75e3df38b29e05f0b64`](https://github.com/wevm/viem/commit/b3c73b94f0e589da6217c75e3df38b29e05f0b64) Thanks [@jxom](https://github.com/jxom)! - Added `getBlobBaseFee` to public decorators.

- [#1931](https://github.com/wevm/viem/pull/1931) [`798b34602cfe41ddba8f0b3e13dd086fdc7c3357`](https://github.com/wevm/viem/commit/798b34602cfe41ddba8f0b3e13dd086fdc7c3357) Thanks [@Rahat-ch](https://github.com/Rahat-ch)! - Added Morph Sepolia Testnet

- [#1913](https://github.com/wevm/viem/pull/1913) [`b078820856c0d1093fcf961f389dab269c605e0e`](https://github.com/wevm/viem/commit/b078820856c0d1093fcf961f389dab269c605e0e) Thanks [@bthaile](https://github.com/bthaile)! - Added Flow previewnet evm network

## 2.8.6

### Patch Changes

- [`90b4e572357211e338ced87ff339d6fc5654fc6f`](https://github.com/wevm/viem/commit/90b4e572357211e338ced87ff339d6fc5654fc6f) Thanks [@jxom](https://github.com/jxom)! - Fixed OP Stack `getSourceHash` function

- [`589cd1e636fc2355d61b51d05e5fe203dcde8bd0`](https://github.com/wevm/viem/commit/589cd1e636fc2355d61b51d05e5fe203dcde8bd0) Thanks [@jxom](https://github.com/jxom)! - Fixed Optimism API url.

- [`7fd24316657877be9af83d97f71a0f5643441401`](https://github.com/wevm/viem/commit/7fd24316657877be9af83d97f71a0f5643441401) Thanks [@jxom](https://github.com/jxom)! - Fixed case where a node could return a malformed error.

## 2.8.5

### Patch Changes

- [`e0c9729bec77fe33c733281e603fe07be92b9076`](https://github.com/wevm/viem/commit/e0c9729bec77fe33c733281e603fe07be92b9076) Thanks [@jxom](https://github.com/jxom)! - Added `onFetchResponse` to `http` transport.

## 2.8.4

### Patch Changes

- [`c8dae3c8c2c932ec5609e81a8c6d81042193e553`](https://github.com/wevm/viem/commit/c8dae3c8c2c932ec5609e81a8c6d81042193e553) Thanks [@jxom](https://github.com/jxom)! - Exported OP Stack `serializeTransaction` for chain type inference.

## 2.8.3

### Patch Changes

- [`1041db5e2b0ae3e651ce031f538f66c1bfef9b76`](https://github.com/wevm/viem/commit/1041db5e2b0ae3e651ce031f538f66c1bfef9b76) Thanks [@jxom](https://github.com/jxom)! - Exported types required for inference.

## 2.8.2

### Patch Changes

- [`67c09385e2c928c6cf6b3aeb87544c41828c5505`](https://github.com/wevm/viem/commit/67c09385e2c928c6cf6b3aeb87544c41828c5505) Thanks [@jxom](https://github.com/jxom)! - Exported `PrepareTransactionRequestRequest` type.

## 2.8.1

### Patch Changes

- [`15935b7913cd55470b270f03f98517e355e54a92`](https://github.com/wevm/viem/commit/15935b7913cd55470b270f03f98517e355e54a92) Thanks [@jxom](https://github.com/jxom)! - Added support for passing `blobs` to `eth_sendTransaction`.

- [#1929](https://github.com/wevm/viem/pull/1929) [`7d809ff0bad4d81a13d01b9e936a505df1ccef39`](https://github.com/wevm/viem/commit/7d809ff0bad4d81a13d01b9e936a505df1ccef39) Thanks [@wkyleg](https://github.com/wkyleg)! - Deduped `eth_subscribe` instantiation on `watchBlockNumber`.

- [#1921](https://github.com/wevm/viem/pull/1921) [`c485df25f618b5a5e84077f419dc2e3c4f78256a`](https://github.com/wevm/viem/commit/c485df25f618b5a5e84077f419dc2e3c4f78256a) Thanks [@Songkeys](https://github.com/Songkeys)! - Added rss3 mainnet and testnet chains.

## 2.8.0

### Minor Changes

- [#1740](https://github.com/wevm/viem/pull/1740) [`c706328c5a0a0b1d7a146f1be5bb9dcb91dc3d64`](https://github.com/wevm/viem/commit/c706328c5a0a0b1d7a146f1be5bb9dcb91dc3d64) Thanks [@jxom](https://github.com/jxom)! - Added support for signing & sending blob transactions + blob utilities.

### Patch Changes

- [#1915](https://github.com/wevm/viem/pull/1915) [`d8fb13100f71d255ebf4f38552887a882a4df9e5`](https://github.com/wevm/viem/commit/d8fb13100f71d255ebf4f38552887a882a4df9e5) Thanks [@eyqs](https://github.com/eyqs)! - Added Plume Testnet chain.

## 2.7.22

### Patch Changes

- [#1919](https://github.com/wevm/viem/pull/1919) [`94cda7f990ac479334b427c9765c47c6726fa54d`](https://github.com/wevm/viem/commit/94cda7f990ac479334b427c9765c47c6726fa54d) Thanks [@roninjin10](https://github.com/roninjin10)! - Fixed incorrect OP Stack L1 fee estimation.

## 2.7.21

### Patch Changes

- [#1881](https://github.com/wevm/viem/pull/1881) [`b468c8749751b97b6c9a1ecb733e087580a989c5`](https://github.com/wevm/viem/commit/b468c8749751b97b6c9a1ecb733e087580a989c5) Thanks [@roninjin10](https://github.com/roninjin10)! - Added proof validation for OP Stack's `buildProveWithdrawal`.

## 2.7.20

### Patch Changes

- [#1901](https://github.com/wevm/viem/pull/1901) [`094c8b5da0555fde0c9456f58b2a948233b705ee`](https://github.com/wevm/viem/commit/094c8b5da0555fde0c9456f58b2a948233b705ee) Thanks [@YanYuanFE](https://github.com/YanYuanFE)! - Added Mint Sepolia chain.

- [#1892](https://github.com/wevm/viem/pull/1892) [`fc6698322f798dd951b11e5dc1879d27ae7b3fe7`](https://github.com/wevm/viem/commit/fc6698322f798dd951b11e5dc1879d27ae7b3fe7) Thanks [@PierreOssun](https://github.com/PierreOssun)! - Add Astar zkEVM & testnet chains.

- [#1906](https://github.com/wevm/viem/pull/1906) [`a82924d0aaf8a4644d6c620209a3d79d9ab0ac92`](https://github.com/wevm/viem/commit/a82924d0aaf8a4644d6c620209a3d79d9ab0ac92) Thanks [@RobbyUitbeijerse](https://github.com/RobbyUitbeijerse)! - Added Beam chains.

## 2.7.19

### Patch Changes

- [`367eef3aa1879172df46cfd803419747d81086ff`](https://github.com/wevm/viem/commit/367eef3aa1879172df46cfd803419747d81086ff) Thanks [@jxom](https://github.com/jxom)! - Fixed issue where zero gas fees would bypass Celo's transaction type detection.

## 2.7.18

### Patch Changes

- [#1891](https://github.com/wevm/viem/pull/1891) [`6dbc8d4af38b39a1372dfa130e7c6e0105a3deee`](https://github.com/wevm/viem/commit/6dbc8d4af38b39a1372dfa130e7c6e0105a3deee) Thanks [@JazzBashara](https://github.com/JazzBashara)! - Replaced SnowTrace with SnowScan for avalancheFuji

## 2.7.17

### Patch Changes

- [#1878](https://github.com/wevm/viem/pull/1878) [`42d9d9fe2d96d3c1e50f61fb03f3623e3e4ef29e`](https://github.com/wevm/viem/commit/42d9d9fe2d96d3c1e50f61fb03f3623e3e4ef29e) Thanks [@wighawag](https://github.com/wighawag)! - Added `getL1BaseFee` action for OP Stack.

- [#1883](https://github.com/wevm/viem/pull/1883) [`929a00f06b1de6e6e1d489e36e7232a3c7bf4a43`](https://github.com/wevm/viem/commit/929a00f06b1de6e6e1d489e36e7232a3c7bf4a43) Thanks [@ibrosen](https://github.com/ibrosen)! - Added Blast chain.

- [#1879](https://github.com/wevm/viem/pull/1879) [`7e01bf01b6dc85899eba5b25a1ce41d1640fc59a`](https://github.com/wevm/viem/commit/7e01bf01b6dc85899eba5b25a1ce41d1640fc59a) Thanks [@SergeevDmitry](https://github.com/SergeevDmitry)! - Added Auroria Testnet chain.

- [#1877](https://github.com/wevm/viem/pull/1877) [`c30eb49f89cef8704d6dcb5eae8e02a3247adb65`](https://github.com/wevm/viem/commit/c30eb49f89cef8704d6dcb5eae8e02a3247adb65) Thanks [@wighawag](https://github.com/wighawag)! - add definitions for ancient8 mainnet and testnet

- [#1884](https://github.com/wevm/viem/pull/1884) [`386a0be9ea92d6dbf2833a7a8d90b5e8c4c637d4`](https://github.com/wevm/viem/commit/386a0be9ea92d6dbf2833a7a8d90b5e8c4c637d4) Thanks [@cauu](https://github.com/cauu)! - Added Merlin chain.

## 2.7.16

### Patch Changes

- [#1866](https://github.com/wevm/viem/pull/1866) [`91a1b784f49cb30f803c1179dcacb7481fe9a328`](https://github.com/wevm/viem/commit/91a1b784f49cb30f803c1179dcacb7481fe9a328) Thanks [@pegahcarter](https://github.com/pegahcarter)! - Added Fraxtal chains.

- [#1868](https://github.com/wevm/viem/pull/1868) [`b3254f9b59471c76534b09d7b2c34e2f9d192389`](https://github.com/wevm/viem/commit/b3254f9b59471c76534b09d7b2c34e2f9d192389) Thanks [@hstarorg](https://github.com/hstarorg)! - Added BNB Greenfield chain.

- [#1872](https://github.com/wevm/viem/pull/1872) [`5986ba14236c23fdbc55cd3b9dcccca7bbc24d4c`](https://github.com/wevm/viem/commit/5986ba14236c23fdbc55cd3b9dcccca7bbc24d4c) Thanks [@Tschakki](https://github.com/Tschakki)! - Added Lisk Sepolia

## 2.7.15

### Patch Changes

- [#1860](https://github.com/wevm/viem/pull/1860) [`83ece5674715759bd2af821f48e98afbed0e0692`](https://github.com/wevm/viem/commit/83ece5674715759bd2af821f48e98afbed0e0692) Thanks [@YanYuanFE](https://github.com/YanYuanFE)! - Added Zetachain.

## 2.7.14

### Patch Changes

- [#1817](https://github.com/wevm/viem/pull/1817) [`4f3de2da33cf7c2eeb5488ed9941cb014d0beaee`](https://github.com/wevm/viem/commit/4f3de2da33cf7c2eeb5488ed9941cb014d0beaee) Thanks [@TheGreatAxios](https://github.com/TheGreatAxios)! - Migrated SKALE Testnet chains to new testnet networks.

- [#1846](https://github.com/wevm/viem/pull/1846) [`f44bc9649860c821d59db0fdbc2a5f3673c23146`](https://github.com/wevm/viem/commit/f44bc9649860c821d59db0fdbc2a5f3673c23146) Thanks [@twynne20](https://github.com/twynne20)! - Added Anvil chain (deprecate `foundry`).

- [`a098c98231d47ccac9bda1a944880b034020a1b5`](https://github.com/wevm/viem/commit/a098c98231d47ccac9bda1a944880b034020a1b5) Thanks [@jxom](https://github.com/jxom)! - Fixed `multicall` types for payable/non-payable functions.

- [#1841](https://github.com/wevm/viem/pull/1841) [`0054c88da5fede080e32fc58d3c2196ebab64ffa`](https://github.com/wevm/viem/commit/0054c88da5fede080e32fc58d3c2196ebab64ffa) Thanks [@mehmetraufoguz](https://github.com/mehmetraufoguz)! - Added MetaChain Istanbul chain.

- [`50ac4762d0cabdb0f46bc2f7fe74331f328883bd`](https://github.com/wevm/viem/commit/50ac4762d0cabdb0f46bc2f7fe74331f328883bd) Thanks [@jxom](https://github.com/jxom)! - Fixed `v` derivation for legacy transactions (#1849)

## 2.7.13

### Patch Changes

- [`0c2b6b2e574e95fe5cb900030c46251cb405bef2`](https://github.com/wevm/viem/commit/0c2b6b2e574e95fe5cb900030c46251cb405bef2) Thanks [@jxom](https://github.com/jxom)! - Exported chain types required for inference.

- [#1838](https://github.com/wevm/viem/pull/1838) [`66a421d1592040a39bd5dce4ce8e8555d1dcbd86`](https://github.com/wevm/viem/commit/66a421d1592040a39bd5dce4ce8e8555d1dcbd86) Thanks [@Fluffynorth](https://github.com/Fluffynorth)! - Added Phoenix chain.

- [#1833](https://github.com/wevm/viem/pull/1833) [`3677a5ad783eff85bebcf4e0d41c393db06737af`](https://github.com/wevm/viem/commit/3677a5ad783eff85bebcf4e0d41c393db06737af) Thanks [@wk0](https://github.com/wk0)! - Added `sourceId` to Blast Sepolia chain.

- [#1837](https://github.com/wevm/viem/pull/1837) [`9023409423583b09cf8b6129ddcd8e7f2136c95a`](https://github.com/wevm/viem/commit/9023409423583b09cf8b6129ddcd8e7f2136c95a) Thanks [@monodyle](https://github.com/monodyle)! - Updated Saigon explorer URL.

## 2.7.12

### Patch Changes

- [#1831](https://github.com/wevm/viem/pull/1831) [`bd7e4bcc84e3400aef242db3a1e05df47123064b`](https://github.com/wevm/viem/commit/bd7e4bcc84e3400aef242db3a1e05df47123064b) Thanks [@holic](https://github.com/holic)! - Exported `getAction`.

- [#1826](https://github.com/wevm/viem/pull/1826) [`554dae0942af8cda6599e4ce4c0ad4d1b090526b`](https://github.com/wevm/viem/commit/554dae0942af8cda6599e4ce4c0ad4d1b090526b) Thanks [@joshuanwankwo](https://github.com/joshuanwankwo)! - Added Mode chain.

## 2.7.11

### Patch Changes

- [#1824](https://github.com/wevm/viem/pull/1824) [`1c715eb2c7ccd8bd6e4566c00d97d3eb07752a4d`](https://github.com/wevm/viem/commit/1c715eb2c7ccd8bd6e4566c00d97d3eb07752a4d) Thanks [@JazzBashara](https://github.com/JazzBashara)! - Updated Avalanche explorer to snowscan.xyz, a product of Etherscan.

- [#1813](https://github.com/wevm/viem/pull/1813) [`d267f1a17d3fb13ed22c50eaef2bc748e5e2a773`](https://github.com/wevm/viem/commit/d267f1a17d3fb13ed22c50eaef2bc748e5e2a773) Thanks [@NicolasMahe](https://github.com/NicolasMahe)! - Updated Lightlink RPC urls

## 2.7.10

### Patch Changes

- [#1804](https://github.com/wevm/viem/pull/1804) [`223ccc5814952e7644a551e9d1f9adaa7ea1c590`](https://github.com/wevm/viem/commit/223ccc5814952e7644a551e9d1f9adaa7ea1c590) Thanks [@dawsbot](https://github.com/dawsbot)! - Upgraded `isAddress` to return false for addresses that contain an invalid checksum.

- [#1811](https://github.com/wevm/viem/pull/1811) [`9f4cbad2aa5d24211f0602a265faddcd3b2edf1f`](https://github.com/wevm/viem/commit/9f4cbad2aa5d24211f0602a265faddcd3b2edf1f) Thanks [@0xbeny](https://github.com/0xbeny)! - Added multicall to XDC mainnet and testnet

- [#1814](https://github.com/wevm/viem/pull/1814) [`7d81244ffb6b520ab4b809131a12d8731a238a2d`](https://github.com/wevm/viem/commit/7d81244ffb6b520ab4b809131a12d8731a238a2d) Thanks [@lukasrosario](https://github.com/lukasrosario)! - Added L1StandardBridge addresses to OP Stack chains

## 2.7.9

### Patch Changes

- [#1806](https://github.com/wevm/viem/pull/1806) [`9ce678b91cad0b1535ec7795128f5989f4446f24`](https://github.com/wevm/viem/commit/9ce678b91cad0b1535ec7795128f5989f4446f24) Thanks [@maxencerb](https://github.com/maxencerb)! - Fixed wallet actions types

- [#1805](https://github.com/wevm/viem/pull/1805) [`f5833b7c3e6b820f442ceb7cc0abfd34003f50ce`](https://github.com/wevm/viem/commit/f5833b7c3e6b820f442ceb7cc0abfd34003f50ce) Thanks [@bajpai244](https://github.com/bajpai244)! - Added Kakarot Sepolia chain.

- [#1802](https://github.com/wevm/viem/pull/1802) [`9f8196fcc08c84be2b69a11907c6c33d37532a29`](https://github.com/wevm/viem/commit/9f8196fcc08c84be2b69a11907c6c33d37532a29) Thanks [@sashaaldrick](https://github.com/sashaaldrick)! - Added Etherlink Testnet chain.

## 2.7.8

### Patch Changes

- [#1792](https://github.com/wevm/viem/pull/1792) [`da2b00c710b1909acd5f07b5cff8f525d3d61a79`](https://github.com/wevm/viem/commit/da2b00c710b1909acd5f07b5cff8f525d3d61a79) Thanks [@kim-hera](https://github.com/kim-hera)! - Added multicall address to Blast Sepolia.

- [#1794](https://github.com/wevm/viem/pull/1794) [`c456ba87f5fc94321e8ae619fefa0c7d011ba53d`](https://github.com/wevm/viem/commit/c456ba87f5fc94321e8ae619fefa0c7d011ba53d) Thanks [@roninjin10](https://github.com/roninjin10)! - Fixed `gas` derivation in OP Stack's `proveWithdrawal`.

## 2.7.7

### Patch Changes

- [#1787](https://github.com/wevm/viem/pull/1787) [`38a88e27e514e5a992335ccd27015113adcb30b1`](https://github.com/wevm/viem/commit/38a88e27e514e5a992335ccd27015113adcb30b1) Thanks [@0xfourzerofour](https://github.com/0xfourzerofour)! - Added Polygon Amoy to chains.

## 2.7.5

### Patch Changes

- [`df2d17de952bcb58d31efbc71ebbec909cea7d8a`](https://github.com/wevm/viem/commit/df2d17de952bcb58d31efbc71ebbec909cea7d8a) Thanks [@jxom](https://github.com/jxom)! - Fixed inference on formatter return type.

## 2.7.4

### Patch Changes

- [#1768](https://github.com/wevm/viem/pull/1768) [`010390000d628b6a2bc532458da224740cfd9237`](https://github.com/wevm/viem/commit/010390000d628b6a2bc532458da224740cfd9237) Thanks [@gjj](https://github.com/gjj)! - Added X1 Testnet chain.

## 2.7.3

### Patch Changes

- [#1776](https://github.com/wevm/viem/pull/1776) [`444f61def8f7a3be0cae4e11eca7a9bb4ef12799`](https://github.com/wevm/viem/commit/444f61def8f7a3be0cae4e11eca7a9bb4ef12799) Thanks [@tmm](https://github.com/tmm)! - Added missing state override error types.

- [#1759](https://github.com/wevm/viem/pull/1759) [`7d89ce8a4021719aba74c62c54228b9bc51ac9c9`](https://github.com/wevm/viem/commit/7d89ce8a4021719aba74c62c54228b9bc51ac9c9) Thanks [@maxencerb](https://github.com/maxencerb)! - Added `stateOverride` property to `call`, `simulateContract`, `readContract`, and `multicall`.

## 2.7.2

### Patch Changes

- [#1764](https://github.com/wevm/viem/pull/1764) [`525bf85165fc2eba57445f6ed0076c243748e978`](https://github.com/wevm/viem/commit/525bf85165fc2eba57445f6ed0076c243748e978) Thanks [@franm91](https://github.com/franm91)! - Renamed Optimism Sepolia chain

- [`1852477ee428f55bf78c68744a6aa3e2f5bac05b`](https://github.com/wevm/viem/commit/1852477ee428f55bf78c68744a6aa3e2f5bac05b) Thanks [@jxom](https://github.com/jxom)! - Fixed `SendTransactionErrorType`.

- [#1758](https://github.com/wevm/viem/pull/1758) [`232c4d34a5ee57ad55bac734f97eb58c9f402b4b`](https://github.com/wevm/viem/commit/232c4d34a5ee57ad55bac734f97eb58c9f402b4b) Thanks [@bguiz](https://github.com/bguiz)! - Added Hedera chains.

## 2.7.1

### Patch Changes

- [`3c1d790e57c667ded5321d6861d9c5d4cbc38a3a`](https://github.com/wevm/viem/commit/3c1d790e57c667ded5321d6861d9c5d4cbc38a3a) Thanks [@jxom](https://github.com/jxom)! - Added `retryCount` & `retryDelay` as a property to `waitForTransactionReceipt`.

## 2.7.0

### Minor Changes

- [#1754](https://github.com/wevm/viem/pull/1754) [`85cc1a81d81f789ccc5b587ab99940095100e616`](https://github.com/wevm/viem/commit/85cc1a81d81f789ccc5b587ab99940095100e616) Thanks [@jxom](https://github.com/jxom)! - Added types & formatters for EIP-4844 Blob Transactions.

## 2.6.1

### Patch Changes

- [#1748](https://github.com/wevm/viem/pull/1748) [`bf25d0e66e1069aacad2bef7a3815fcbe73b91d9`](https://github.com/wevm/viem/commit/bf25d0e66e1069aacad2bef7a3815fcbe73b91d9) Thanks [@zongzheng123](https://github.com/zongzheng123)! - Added multicall3 contract configuration for Iotex.

- [#1743](https://github.com/wevm/viem/pull/1743) [`8ae627ecde6fa44b767a45e88c71c61703c2acad`](https://github.com/wevm/viem/commit/8ae627ecde6fa44b767a45e88c71c61703c2acad) Thanks [@molecula451](https://github.com/molecula451)! - Added OORT MainnetDev(Testnet) Chain

- [#1750](https://github.com/wevm/viem/pull/1750) [`478333671230de0431a3d93fa8a500ed985fa1c2`](https://github.com/wevm/viem/commit/478333671230de0431a3d93fa8a500ed985fa1c2) Thanks [@TateB](https://github.com/TateB)! - Added ENS Registry and ENS Universal Resolver addresses for Holesky.

## 2.6.0

### Minor Changes

- [#1665](https://github.com/wevm/viem/pull/1665) [`09a4d9eef6ab766ff48f2b7272fad129f6deef74`](https://github.com/wevm/viem/commit/09a4d9eef6ab766ff48f2b7272fad129f6deef74) Thanks [@mariopil](https://github.com/mariopil)! - Added zkSync Extensions.

### Patch Changes

- [#1718](https://github.com/wevm/viem/pull/1718) [`4593b65d2baa708e1d67e8f5cc606891f0ead4c9`](https://github.com/wevm/viem/commit/4593b65d2baa708e1d67e8f5cc606891f0ead4c9) Thanks [@xsubject](https://github.com/xsubject)! - Added Berachain Testnet chain.

## 2.5.1

### Patch Changes

- [#1736](https://github.com/wevm/viem/pull/1736) [`0dcfae5e76ed739e416b45512c1197ebe2958b31`](https://github.com/wevm/viem/commit/0dcfae5e76ed739e416b45512c1197ebe2958b31) Thanks [@izayl](https://github.com/izayl)! - Updated zkSync explorer

- [#1737](https://github.com/wevm/viem/pull/1737) [`9fb40ea88290464dc0e3ea2796dd0608a5ce49ae`](https://github.com/wevm/viem/commit/9fb40ea88290464dc0e3ea2796dd0608a5ce49ae) Thanks [@ibwei](https://github.com/ibwei)! - Added KCC Mainnet chain.

## 2.5.0

### Minor Changes

- [#1724](https://github.com/wevm/viem/pull/1724) [`1aa664cc888516efb828b7e6e90c13993963459b`](https://github.com/wevm/viem/commit/1aa664cc888516efb828b7e6e90c13993963459b) Thanks [@jxom](https://github.com/jxom)! - Added support for IPC transport.

## 2.4.1

### Patch Changes

- [#1704](https://github.com/wevm/viem/pull/1704) [`e7eadff4e75c86a515f95addd64e93791a5340d3`](https://github.com/wevm/viem/commit/e7eadff4e75c86a515f95addd64e93791a5340d3) Thanks [@armatrix](https://github.com/armatrix)! - Added Blast Sepolia.

## 2.4.0

### Minor Changes

- [#1716](https://github.com/wevm/viem/pull/1716) [`0b4ee201219fe2fec8d6d33051603776765bed06`](https://github.com/wevm/viem/commit/0b4ee201219fe2fec8d6d33051603776765bed06) Thanks [@jxom](https://github.com/jxom)! - - Added `toEventHash`.
  - Added `toFunctionHash`.
  - Deprecated `getEventSelector` (use `toEventSelector`).
  - Deprecated `getFunctionSelector` (use `toFunctionSelector`).
  - Deprecated `getEventSignature` (use `toEventSignature`).
  - Deprecated `getFunctionSignature` (use `toFunctionSignature`).

## 2.3.1

### Patch Changes

- [#1712](https://github.com/wevm/viem/pull/1712) [`5e30b542fbad19ba35dd7fb378765ee1f7c614dc`](https://github.com/wevm/viem/commit/5e30b542fbad19ba35dd7fb378765ee1f7c614dc) Thanks [@0xOlias](https://github.com/0xOlias)! - Updated Base Sepolia explorer URL.

## 2.3.0

### Minor Changes

- [#1676](https://github.com/wevm/viem/pull/1676) [`0ca8818c83636775886a1a9f261b2ea73840c9d7`](https://github.com/wevm/viem/commit/0ca8818c83636775886a1a9f261b2ea73840c9d7) Thanks [@TateB](https://github.com/TateB)! - Added `gatewayUrls` and `strict` properties to ENS Actions.

### Patch Changes

- [#1706](https://github.com/wevm/viem/pull/1706) [`5b27bef47245ea0e5a12955bb0571bf8fe7f1270`](https://github.com/wevm/viem/commit/5b27bef47245ea0e5a12955bb0571bf8fe7f1270) Thanks [@sakulstra](https://github.com/sakulstra)! - Replaces the default block explorer on gnosis from blockscout to gnosisscan.

- [`10d1177a2e9497e87e37d5c9f7753583084266ca`](https://github.com/wevm/viem/commit/10d1177a2e9497e87e37d5c9f7753583084266ca) Thanks [@jxom](https://github.com/jxom)! - Fixed issue where `prepareTransactionRequest` would ignore a provided `maxPriorityFeePerGas` of zero.

## 2.2.0

### Minor Changes

- [#1708](https://github.com/wevm/viem/pull/1708) [`217174da0ff9f2179e1d800692f6fa1b094984a3`](https://github.com/wevm/viem/commit/217174da0ff9f2179e1d800692f6fa1b094984a3) Thanks [@tmm](https://github.com/tmm)! - Bumped abitype

## 2.1.1

### Patch Changes

- [#1693](https://github.com/wevm/viem/pull/1693) [`d3ec8be8`](https://github.com/wevm/viem/commit/d3ec8be8bba0eff16fa0b9d812761f4fd2bb3c3a) Thanks [@NicolasMahe](https://github.com/NicolasMahe)! - Add multicall3 contract to Neon EVM MainNet

- [#1695](https://github.com/wevm/viem/pull/1695) [`ac052a4d`](https://github.com/wevm/viem/commit/ac052a4dae4b1fc503c3e09e175f5f88522d4635) Thanks [@NicolasMahe](https://github.com/NicolasMahe)! - Add Lightlink Phoenix and Pegasus chains

## 2.1.0

### Minor Changes

- [`06105dfc`](https://github.com/wevm/viem/commit/06105dfcb01571f9278e0268f30c954f58958e2b) Thanks [@jxom](https://github.com/jxom)! - Refactored ABI decoding implementation to use a cursor instead of array copies, and prevent excessive recursive pointers.

### Patch Changes

- [#1691](https://github.com/wevm/viem/pull/1691) [`8d011e8b`](https://github.com/wevm/viem/commit/8d011e8bf13685fe51e8cb69d6ef633fa1247e9a) Thanks [@skenaja](https://github.com/skenaja)! - Added Palm and Palm Testnet chains

- [#1684](https://github.com/wevm/viem/pull/1684) [`06a28ddb`](https://github.com/wevm/viem/commit/06a28ddbb69e51c6288e2dad0ff3b99b209e5276) Thanks [@Yuripetusko](https://github.com/Yuripetusko)! - Added Multicall3 config to Base Sepolia chain definition

## 2.0.10

### Patch Changes

- [#1689](https://github.com/wevm/viem/pull/1689) [`0216aff9`](https://github.com/wevm/viem/commit/0216aff904354e209d598c7b67b7ab5f156d94f6) Thanks [@tmm](https://github.com/tmm)! - Removed non-default chain properties.

## 2.0.9

### Patch Changes

- [#1687](https://github.com/wevm/viem/pull/1687) [`ffc3f255`](https://github.com/wevm/viem/commit/ffc3f255ac2483e4974e1c6d879ecf2247e36b01) Thanks [@0xOlias](https://github.com/0xOlias)! - Added API URLs for block explorers in `viem/chains`.

## 2.0.8

### Patch Changes

- [#1679](https://github.com/wevm/viem/pull/1679) [`c10c68ef`](https://github.com/wevm/viem/commit/c10c68eff0d02f0dcc0970bcceddd026801b27bd) Thanks [@marthendalnunes](https://github.com/marthendalnunes)! - Exported `deployContract` and `getContractEvents`.

## 2.0.7

### Patch Changes

- [#1677](https://github.com/wevm/viem/pull/1677) [`e74a80c9`](https://github.com/wevm/viem/commit/e74a80c9f90abb60d1bc88501892bcfd83930baf) Thanks [@cong1223](https://github.com/cong1223)! - Added Etherscan link for zkSync.

- [#1661](https://github.com/wevm/viem/pull/1661) [`4fdc1d9f`](https://github.com/wevm/viem/commit/4fdc1d9fe25b4ff7d9583188f2450c3ed144026c) Thanks [@zkgggggame](https://github.com/zkgggggame)! - Added multicall3 to Mantle Testnet.

- [#1674](https://github.com/wevm/viem/pull/1674) [`c3bcf486`](https://github.com/wevm/viem/commit/c3bcf4868d76c1535dfa3802cd37baf778cb5494) Thanks [@mr-kenikh](https://github.com/mr-kenikh)! - Added multicall3 for zkFair Mainnet

- [#1667](https://github.com/wevm/viem/pull/1667) [`d697cf99`](https://github.com/wevm/viem/commit/d697cf996eca039e429bff91024179f27dc32f77) Thanks [@mehmetraufoguz](https://github.com/mehmetraufoguz)! - Added MetaChain chain.

## 2.0.6

### Patch Changes

- [#1462](https://github.com/wevm/viem/pull/1462) [`f1aaca8f`](https://github.com/wevm/viem/commit/f1aaca8f104d3595fd86018d28f0bf97cdd8dcc8) Thanks [@0xarthurxyz](https://github.com/0xarthurxyz)! - Removed Celo Cannoli testnet which is [deprecated](https://forum.celo.org/t/cannoli-testnet-deprecation-announcement/6796).

## 2.0.5

### Patch Changes

- [#1659](https://github.com/wevm/viem/pull/1659) [`d8740646`](https://github.com/wevm/viem/commit/d8740646c83d3064ea103928a00928a3c260ed65) Thanks [@d1onys1us](https://github.com/d1onys1us)! - Added Taiko Katla chain.

- [#1663](https://github.com/wevm/viem/pull/1663) [`e22c85e8`](https://github.com/wevm/viem/commit/e22c85e8149f8ec7b255655ced70dc3dbc3e1383) Thanks [@saqlain1020](https://github.com/saqlain1020)! - Exported `parseEventLogs` (and types).

- [#1662](https://github.com/wevm/viem/pull/1662) [`71d14759`](https://github.com/wevm/viem/commit/71d14759acfaef4d0589e98b3c97b11f2a91e561) Thanks [@zkgggggame](https://github.com/zkgggggame)! - Added multicall3 to Taiko Jolnir.

- [`14ad813f`](https://github.com/wevm/viem/commit/14ad813fed2d9ee97e053e8b7d701faf9e68f0cf) Thanks [@jxom](https://github.com/jxom)! - Fixed extreme edge-case where decoding a **malformed** payload against a nested array type could cause \`decodeAbiParameters\` to enter an infinite loop.

## 2.0.4

### Patch Changes

- [`991b2936`](https://github.com/wevm/viem/commit/991b29367ea2ef594d1daa1c3f82fb5f1dffc046) Thanks [@jxom](https://github.com/jxom)! - Return derived URL in HTTP transport.

- [#1657](https://github.com/wevm/viem/pull/1657) [`7ddff316`](https://github.com/wevm/viem/commit/7ddff31654f214c9edf2be77afc0ac8d58ac297c) Thanks [@tmm](https://github.com/tmm)! - Fixed `writeContract` `args` type inference.

## 2.0.3

### Patch Changes

- [`fdd2435c`](https://github.com/wevm/viem/commit/fdd2435cadb971a2b34b9d6b7066c7b1cf776116) Thanks [@jxom](https://github.com/jxom)! - Fixed issue where Viem would throw in environments that don't support the `WebSocket` API.

## 2.0.2

### Patch Changes

- [`f7a56b31`](https://github.com/wevm/viem/commit/f7a56b3108511f40a435e3132229027c23f15169) Thanks [@jxom](https://github.com/jxom)! - Fixed proxy packages types.

## 2.0.1

### Patch Changes

- [`61460900`](https://github.com/wevm/viem/commit/61460900276f36937c91d844fb0751c94654c84b) Thanks [@jxom](https://github.com/jxom)! - Added proxy packages for `viem/op-stack`, `viem/celo`, `viem/zksync`.

- [#1644](https://github.com/wevm/viem/pull/1644) [`95f0c596`](https://github.com/wevm/viem/commit/95f0c596144d2868e972d671f7cad617d7fd3b0e) Thanks [@hbriese](https://github.com/hbriese)! - Fixed formatting of zkSync transaction request with `customSignature`

## 2.0.0

### Major Changes

- [#1610](https://github.com/wevm/viem/pull/1610) [`440b3ba7`](https://github.com/wevm/viem/commit/440b3ba7d7faa9e51fe87df07acd6a5d373b3b9a) Thanks [@tmm](https://github.com/tmm)! - Viem 2.0 featuring:
  - [Low-level OP Stack extensions](https://viem.sh/op-stack),
  - Enhanced types,
  - Miscellaneous improvements and bug fixes.

  [Breaking Changes & Migration Guide](https://viem.sh/docs/migration-guide)

## 1.21.4

### Patch Changes

- [#1638](https://github.com/wevm/viem/pull/1638) [`7b7a2907`](https://github.com/wevm/viem/commit/7b7a2907462fdff181246944e5dcb3540c43ffe8) Thanks [@ArmmGh](https://github.com/ArmmGh)! - Added Bahamut Chain and Oasis Testnet.

## 1.21.3

### Patch Changes

- [#1628](https://github.com/wevm/viem/pull/1628) [`489b1096`](https://github.com/wevm/viem/commit/489b109627b2fac4ea27435933fd49626d577388) Thanks [@mr-kenikh](https://github.com/mr-kenikh)! - Added zkFair Mainnet and zkFair Testnet chains.

- [#1629](https://github.com/wevm/viem/pull/1629) [`e6855a9b`](https://github.com/wevm/viem/commit/e6855a9b650ecfda3de3ed395fe8a38906709f5e) Thanks [@shunjizhan](https://github.com/shunjizhan)! - Added Acala chain family

- [#1634](https://github.com/wevm/viem/pull/1634) [`e0594e93`](https://github.com/wevm/viem/commit/e0594e93af384b63052a553f27bffb0606931162) Thanks [@j1h00](https://github.com/j1h00)! - Fixed Klaytn RPC URLs.

- [#1627](https://github.com/wevm/viem/pull/1627) [`a48b2cf7`](https://github.com/wevm/viem/commit/a48b2cf702820f87ce4ad2f1da61c3b42bb0a918) Thanks [@zkgggggame](https://github.com/zkgggggame)! - Updated opBNBTestnet blockExplorer URL

## 1.21.2

### Patch Changes

- [#1602](https://github.com/wevm/viem/pull/1602) [`020ab406`](https://github.com/wevm/viem/commit/020ab4068027f3cbb2ae53d3e8606d104a46251d) Thanks [@avasisht23](https://github.com/avasisht23)! - Added RPC URLs to Base Sepolia

- [#1603](https://github.com/wevm/viem/pull/1603) [`7cc17673`](https://github.com/wevm/viem/commit/7cc1767353f30bf7103600d7c912ce442c2fc3ea) Thanks [@avasisht23](https://github.com/avasisht23)! - Added RPC URLs to Optimism Sepolia

## 1.21.1

### Patch Changes

- [#1621](https://github.com/wevm/viem/pull/1621) [`28054fb9`](https://github.com/wevm/viem/commit/28054fb90cfd64bfaba43cdc13466f1ac23ba44d) Thanks [@nanthanwa](https://github.com/nanthanwa)! - Added Jibchain.

## 1.21.0

### Minor Changes

- [#1618](https://github.com/wevm/viem/pull/1618) [`ad01462d`](https://github.com/wevm/viem/commit/ad01462daa68f4dbd671a003f956c3a6b4d95106) Thanks [@0xArdy](https://github.com/0xArdy)! - Added `strength` parameter to `generateMnemonic`.

### Patch Changes

- [#1617](https://github.com/wevm/viem/pull/1617) [`f0c9c38b`](https://github.com/wevm/viem/commit/f0c9c38bb049817e77d061a25a93ed0ba1159469) Thanks [@TucksonDev](https://github.com/TucksonDev)! - Modified explorer link of Arbitrum Sepolia.

- [#1608](https://github.com/wevm/viem/pull/1608) [`2b84d795`](https://github.com/wevm/viem/commit/2b84d7956e4061ff7ea7ac915f953a4d064f7575) Thanks [@cong1223](https://github.com/cong1223)! - Added BitTorrent & Wemix chains.

## 1.20.3

### Patch Changes

- [`fa2f7352`](https://github.com/wevm/viem/commit/fa2f735232d088c84566a4be4af6be2689bae02d) Thanks [@jxom](https://github.com/jxom)! - Exported `getAddresses` in `viem/actions`

- [#1500](https://github.com/wevm/viem/pull/1500) [`95a5eee1`](https://github.com/wevm/viem/commit/95a5eee10ac76d3379dbf45f7e3803425492fdc2) Thanks [@0xarthurxyz](https://github.com/0xarthurxyz)! - Removed `feeCurrency`, `gatewayFee`, and `gatewayFeeRecipient` properties from Celo transaction receipts.

- [#1597](https://github.com/wevm/viem/pull/1597) [`e318cb37`](https://github.com/wevm/viem/commit/e318cb375c22df6139c4e34bde35abf30dff9cc7) Thanks [@2manslkh](https://github.com/2manslkh)! - Updated Taiko Jolnir RPC URL.

## 1.20.2

### Patch Changes

- [#1560](https://github.com/wevm/viem/pull/1560) [`664778d0`](https://github.com/wevm/viem/commit/664778d0858ebc7c6bfc24a9be096c04d4e604e0) Thanks [@dutterbutter](https://github.com/dutterbutter)! - Added zkSync Sepolia Testnet.

## 1.20.1

### Patch Changes

- [#1570](https://github.com/wevm/viem/pull/1570) [`cbd24e84`](https://github.com/wevm/viem/commit/cbd24e8436da4eb0a0526657ebb9f3175d0c10bd) Thanks [@crackcodesprogramloads](https://github.com/crackcodesprogramloads)! - Added optional alchemy rpcUrls for arbitrumSepolia

- [#1592](https://github.com/wevm/viem/pull/1592) [`482ca63e`](https://github.com/wevm/viem/commit/482ca63eb2c56705ca6c96b766fa98286339091c) Thanks [@roninjin10](https://github.com/roninjin10)! - Added `eth_blobGasFee` type.

## 1.20.0

### Minor Changes

- [#1589](https://github.com/wevm/viem/pull/1589) [`69cf2d05`](https://github.com/wevm/viem/commit/69cf2d05100a211e737ba81718c11b864785d5f3) Thanks [@jxom](https://github.com/jxom)! - Added `ripemd160` and `sha256` hashing functions (re-exported from `@noble/hashes`).

## 1.19.15

### Patch Changes

- [#1586](https://github.com/wevm/viem/pull/1586) [`f9bfa727`](https://github.com/wevm/viem/commit/f9bfa727671452c46df7db4837457d1d9296b8c8) Thanks [@jxom](https://github.com/jxom)! - Fixed an issue where Viem could extract the wrong ABI item if ambiguity is detected within overload ABI items. Now, if ambiguity is detected, an error will be thrown.

## 1.19.14

### Patch Changes

- [#1585](https://github.com/wevm/viem/pull/1585) [`5f54c878`](https://github.com/wevm/viem/commit/5f54c8780be1895d7f22f5d2b90878a81c67ac1f) Thanks [@zapnap](https://github.com/zapnap)! - Added Fantom Sonic Open Testnet

## 1.19.13

### Patch Changes

- [`007fe124`](https://github.com/wevm/viem/commit/007fe124d2c8a5f709a0d691ccbcaaf5f9a6d411) Thanks [@jxom](https://github.com/jxom)! - Fixed issue where `getEnsName` was returning stale results for updated eth records.

## 1.19.12

### Patch Changes

- [#1561](https://github.com/wevm/viem/pull/1561) [`ca3514e7`](https://github.com/wevm/viem/commit/ca3514e7784d2ee6849423b6c97cb235b4a97e16) Thanks [@harisaginting](https://github.com/harisaginting)! - Added Zilliqa chain.

## 1.19.11

### Patch Changes

- [`1218e977`](https://github.com/wevm/viem/commit/1218e977e7d9fa049f67186393b57417d7c8c6a2) Thanks [@jxom](https://github.com/jxom)! - Fixed `BlockNotFoundError` issue on `waitForTransactionReceipt`.

## 1.19.10

### Patch Changes

- [#1547](https://github.com/wevm/viem/pull/1547) [`571d9e5e`](https://github.com/wevm/viem/commit/571d9e5ef032f6d87b7a616e5dfb5f54833647d5) Thanks [@darwintree](https://github.com/darwintree)! - Added WebSocket endpoints for Conflux eSpace chain.

- [#1546](https://github.com/wevm/viem/pull/1546) [`f5d1dbea`](https://github.com/wevm/viem/commit/f5d1dbea361b937b29a768b45f4b745b58cae480) Thanks [@TateB](https://github.com/TateB)! - Fixed an issue where if a CCIP-Read request returned with an undefined body, body.error would still attempt to be read causing an `Cannot read properties of undefined` error, instead of the status text.

- [#1547](https://github.com/wevm/viem/pull/1547) [`571d9e5e`](https://github.com/wevm/viem/commit/571d9e5ef032f6d87b7a616e5dfb5f54833647d5) Thanks [@darwintree](https://github.com/darwintree)! - Added Conflux eSpace Testnet chain

- [#1541](https://github.com/wevm/viem/pull/1541) [`b3f7c11d`](https://github.com/wevm/viem/commit/b3f7c11d698a7f8a8e048c7c57cd9be09f6e96e7) Thanks [@aefhm](https://github.com/aefhm)! - Added Oasis Sapphire Mainnet and Testnet chains

## 1.19.9

### Patch Changes

- [#1533](https://github.com/wevm/viem/pull/1533) [`5897b5b7`](https://github.com/wevm/viem/commit/5897b5b7d040735fa38e6282cec12f166de38618) Thanks [@laitsky](https://github.com/laitsky)! - Added PGN Mainnet & Testnet chain

- [#1532](https://github.com/wevm/viem/pull/1532) [`bd5c6cbf`](https://github.com/wevm/viem/commit/bd5c6cbf8c08ade558109f9d48c503c2a8d9273d) Thanks [@abs3ntdev](https://github.com/abs3ntdev)! - Added multicall3 contract to filecoin

## 1.19.8

### Patch Changes

- [#1529](https://github.com/wevm/viem/pull/1529) [`726c3fd0`](https://github.com/wevm/viem/commit/726c3fd074dc5da1f96c52dcd9fdcc0af8c5a96a) Thanks [@abs3ntdev](https://github.com/abs3ntdev)! - Added Rootstock Mainnet chain.

## 1.19.7

### Patch Changes

- [#1520](https://github.com/wevm/viem/pull/1520) [`4374b7c3`](https://github.com/wevm/viem/commit/4374b7c3e2a9c8d456e04a3b130d89227005c668) Thanks [@lucemans](https://github.com/lucemans)! - Patched `ccipFetch` method to use POST by default when URL includes `{sender}`.

- [#1519](https://github.com/wevm/viem/pull/1519) [`f51a3823`](https://github.com/wevm/viem/commit/f51a38230098755a7ece9e0b42aaabe5673b004e) Thanks [@marcosdellavecchia](https://github.com/marcosdellavecchia)! - Added Shimmer and Shimmer Testnet chains.

## 1.19.6

### Patch Changes

- [#1523](https://github.com/wevm/viem/pull/1523) [`ad355a8d`](https://github.com/wevm/viem/commit/ad355a8d270e9e012d097ac80b9ad63f35682aaa) Thanks [@blukat29](https://github.com/blukat29)! - Added Klaytn Baobab chain.

## 1.19.5

### Patch Changes

- [#1499](https://github.com/wevm/viem/pull/1499) [`115d579d`](https://github.com/wevm/viem/commit/115d579df58b3b7d2d25e1a53c053550ed59bc9a) Thanks [@shazarre](https://github.com/shazarre)! - Fixes an issue where CIP-64 are sent as EIP-1559 transactions

## 1.19.4

### Patch Changes

- [#1512](https://github.com/wevm/viem/pull/1512) [`2d581ac5`](https://github.com/wevm/viem/commit/2d581ac55d9753cd82baa6f8d3b6e5a7cc5b6721) Thanks [@mihoward21](https://github.com/mihoward21)! - Added the multicall address for Aurora

- [#1518](https://github.com/wevm/viem/pull/1518) [`f69c58ab`](https://github.com/wevm/viem/commit/f69c58ab87af6215bf488b19af2be25eeb679b57) Thanks [@melnour](https://github.com/melnour)! - Added Shibarium chain

- [#1493](https://github.com/wevm/viem/pull/1493) [`d554db2e`](https://github.com/wevm/viem/commit/d554db2ebf1da6dbbc67f775818d9d1bdaf1d9ce) Thanks [@linchengzzz](https://github.com/linchengzzz)! - Updated BSC Testnet RPC URL.

- [#1468](https://github.com/wevm/viem/pull/1468) [`7d89f5bc`](https://github.com/wevm/viem/commit/7d89f5bc60092a3db69703839231d32281fdb65b) Thanks [@thevolcanomanishere](https://github.com/thevolcanomanishere)! - Added JSDoc to some utility functions.

## 1.19.3

### Patch Changes

- [#1504](https://github.com/wevm/viem/pull/1504) [`bfdaee74`](https://github.com/wevm/viem/commit/bfdaee744f79b84319fedcddd8934804ff4d782b) Thanks [@jxom](https://github.com/jxom)! - Fixed an issue where some consumer minifiers (ie. Terser, SWC) would drop `Function.prototype.name` causing client action overrides to be ignored.

## 1.19.2

### Patch Changes

- [#1491](https://github.com/wevm/viem/pull/1491) [`ec24d233`](https://github.com/wevm/viem/commit/ec24d2339e8c7b75b0f29dfe1763d2fceefef74e) Thanks [@KholdStare](https://github.com/KholdStare)! - Updated `@adraffy/ens-normalize` dependency.

## 1.19.1

### Patch Changes

- [#1488](https://github.com/wevm/viem/pull/1488) [`f82bc658`](https://github.com/wevm/viem/commit/f82bc658f68baa51fe50ffafa32ea4d6e0af14b9) Thanks [@glitch-txs](https://github.com/glitch-txs)! - Added Chiliz and Spicy chains

## 1.19.0

### Minor Changes

- [#1485](https://github.com/wevm/viem/pull/1485) [`490de5da`](https://github.com/wevm/viem/commit/490de5da023938252d526604763d19f8defe2e62) Thanks [@jxom](https://github.com/jxom)! - Added `yParity` to `Transaction` type.

- [#1486](https://github.com/wevm/viem/pull/1486) [`5e40a875`](https://github.com/wevm/viem/commit/5e40a87502541ffcf1dae5364eef48a2c0085f82) Thanks [@jxom](https://github.com/jxom)! - Added `dumpState` & `loadState` Test Actions.

- [`5bf3a3b2`](https://github.com/wevm/viem/commit/5bf3a3b2da2c2c223b913eae9aea50a0ba834efc) Thanks [@jxom](https://github.com/jxom)! - Added `presignMessagePrefix` and `zeroHash` constants.

- [#1483](https://github.com/wevm/viem/pull/1483) [`5a4e907b`](https://github.com/wevm/viem/commit/5a4e907bd47c78827f28ae5cfb8e1f73067c5fc1) Thanks [@jxom](https://github.com/jxom)! - Support `v` values of 0 or 1 in `serializeTransaction`.

### Patch Changes

- [#1470](https://github.com/wevm/viem/pull/1470) [`a0512a5b`](https://github.com/wevm/viem/commit/a0512a5b107afaef201791647e43e8a9d881c621) Thanks [@marv1n-10xdev](https://github.com/marv1n-10xdev)! - Added LUSKO chain

## 1.18.9

### Patch Changes

- [#1464](https://github.com/wevm/viem/pull/1464) [`32098af0`](https://github.com/wevm/viem/commit/32098af0378c47a4032155f8947f88f9990cd25d) Thanks [@jxom](https://github.com/jxom)! - Fixed issue where `getFunctionSignature`/`getFunctionSelector` would not parse nested tuples in string-based signatures.

## 1.18.8

### Patch Changes

- [`46213902`](https://github.com/wevm/viem/commit/462139026e4e36dd98e4c1da5ff7669f7ffb98ee) Thanks [@jxom](https://github.com/jxom)! - Fixed issue where `chain.nativeCurrency` could be undefined.

## 1.18.7

### Patch Changes

- [`95991301`](https://github.com/wevm/viem/commit/95991301c9eb4a3f2a1bcff8ab36d95ff964e13c) Thanks [@jxom](https://github.com/jxom)! - Fixed an issue where `watchContractEvent` fallback was not scoping events to the provided `eventName`.

- [#1453](https://github.com/wevm/viem/pull/1453) [`e40006aa`](https://github.com/wevm/viem/commit/e40006aad1941d9c77dfd68b07f1acb99f7c8883) Thanks [@0xRaghu](https://github.com/0xRaghu)! - Added Kava Testnet chain.

## 1.18.6

### Patch Changes

- [#1448](https://github.com/wevm/viem/pull/1448) [`c2fab4a7`](https://github.com/wevm/viem/commit/c2fab4a78878d46c6aad403f1ad54677632542eb) Thanks [@jxom](https://github.com/jxom)! - Fixed zkSync formatters.

- [#1434](https://github.com/wevm/viem/pull/1434) [`c0da695a`](https://github.com/wevm/viem/commit/c0da695a76225c7f24ca263f9109e34d8cd93dba) Thanks [@nicolasbrugneaux](https://github.com/nicolasbrugneaux)! - Fixed an issue where Celo CIP64 transactions were being recognized as EIP1559 transactions.

## 1.18.5

### Patch Changes

- [#1438](https://github.com/wevm/viem/pull/1438) [`8e52fcb8`](https://github.com/wevm/viem/commit/8e52fcb8565a9fadce4da31e924894881804f9d2) Thanks [@jxom](https://github.com/jxom)! - Fixed legacy EIP-155 transaction serializing.

## 1.18.4

### Patch Changes

- [#1423](https://github.com/wevm/viem/pull/1423) [`c164bfc6`](https://github.com/wevm/viem/commit/c164bfc6b8beb4243fbe9d222bd03de2814637b2) Thanks [@CJskii](https://github.com/CJskii)! - Updated Klaytn RPC URL.

- [#1423](https://github.com/wevm/viem/pull/1423) [`c164bfc6`](https://github.com/wevm/viem/commit/c164bfc6b8beb4243fbe9d222bd03de2814637b2) Thanks [@CJskii](https://github.com/CJskii)! - Added Astar chain

- [#1435](https://github.com/wevm/viem/pull/1435) [`08e6a68f`](https://github.com/wevm/viem/commit/08e6a68f25736c6517b4f5d567a8ff9b3b59bc11) Thanks [@tmm](https://github.com/tmm)! - Fixed protected action types

- [#1432](https://github.com/wevm/viem/pull/1432) [`33631fb2`](https://github.com/wevm/viem/commit/33631fb2ac281d5804a596c6390b10403cbcfa72) Thanks [@pcdotfan](https://github.com/pcdotfan)! - Removed Scroll Sepolia WebSocket URLs.

- [#1423](https://github.com/wevm/viem/pull/1423) [`c164bfc6`](https://github.com/wevm/viem/commit/c164bfc6b8beb4243fbe9d222bd03de2814637b2) Thanks [@CJskii](https://github.com/CJskii)! - Added Tenet chain

- [#1423](https://github.com/wevm/viem/pull/1423) [`c164bfc6`](https://github.com/wevm/viem/commit/c164bfc6b8beb4243fbe9d222bd03de2814637b2) Thanks [@CJskii](https://github.com/CJskii)! - Add Kava chain

- [#1423](https://github.com/wevm/viem/pull/1423) [`c164bfc6`](https://github.com/wevm/viem/commit/c164bfc6b8beb4243fbe9d222bd03de2814637b2) Thanks [@CJskii](https://github.com/CJskii)! - Added Core Dao chain

## 1.18.3

### Patch Changes

- [#1424](https://github.com/wevm/viem/pull/1424) [`a0052303`](https://github.com/wevm/viem/commit/a0052303f4b6892fac55c2035fe5675890e4d5bf) Thanks [@filoozom](https://github.com/filoozom)! - Added WebSocket RPCs for Gnosis Chain and Chiado

- [#1431](https://github.com/wevm/viem/pull/1431) [`2244017d`](https://github.com/wevm/viem/commit/2244017d7603f2253b4faaf6c543c8c7a04f7595) Thanks [@filoozom](https://github.com/filoozom)! - Added the multicall address for Chiado

- [#1426](https://github.com/wevm/viem/pull/1426) [`c81141a5`](https://github.com/wevm/viem/commit/c81141a5402d9114856c6a706782085905dbfb13) Thanks [@mnedelchev-vn](https://github.com/mnedelchev-vn)! - Added Neon Mainnet chain.

## 1.18.2

### Patch Changes

- [#1417](https://github.com/wevm/viem/pull/1417) [`ba17c65e`](https://github.com/wevm/viem/commit/ba17c65ee5d7ab4804472784acb545805507cdfe) Thanks [@holic](https://github.com/holic)! - Fixed `concat` parameter type.

- [#1415](https://github.com/wevm/viem/pull/1415) [`5db156aa`](https://github.com/wevm/viem/commit/5db156aa8b95bc421c82e93b092b2a8bf9b62666) Thanks [@0xKheops](https://github.com/0xKheops)! - Added sorting mechanism to batch scheduler.

## 1.18.1

### Patch Changes

- [#1409](https://github.com/wevm/viem/pull/1409) [`229e2d56`](https://github.com/wevm/viem/commit/229e2d565d9d07b9208753f46668378dccf3d399) Thanks [@qbzzt](https://github.com/qbzzt)! - Fixed Holesky public RPC URL.

## 1.18.0

### Minor Changes

- [#1402](https://github.com/wevm/viem/pull/1402) [`09778291`](https://github.com/wevm/viem/commit/0977829160effbe7dac5a69f43d263605544fa19) Thanks [@jxom](https://github.com/jxom)! - Added `extractChain` utility.

- [#1388](https://github.com/wevm/viem/pull/1388) [`d872061d`](https://github.com/wevm/viem/commit/d872061d1c6a791142027e59e39cfa44d9780631) Thanks [@speeddragon](https://github.com/speeddragon)! - Added ZkSync serializers

- [#1379](https://github.com/wevm/viem/pull/1379) [`fb395900`](https://github.com/wevm/viem/commit/fb3959009ad79a258316389e29d917869d23ff5e) Thanks [@yerdua](https://github.com/yerdua)! - Added support for Celo CIP-64 transactions

- [#1361](https://github.com/wevm/viem/pull/1361) [`70593019`](https://github.com/wevm/viem/commit/70593019d364a230a7cec87c2832e2135d8fedb8) Thanks [@speeddragon](https://github.com/speeddragon)! - Added ZkSync formatters.

## 1.17.2

### Patch Changes

- [#1399](https://github.com/wevm/viem/pull/1399) [`210e2b94`](https://github.com/wevm/viem/commit/210e2b943d6d04ab130151dfdb5a94e590e42fd4) Thanks [@codespool](https://github.com/codespool)! - Added multicall3 contract to astarZkatana

- [#1395](https://github.com/wevm/viem/pull/1395) [`1e206f46`](https://github.com/wevm/viem/commit/1e206f460ad21e2525bfc28ef89fd524b1dfaf2e) Thanks [@linchengzzz](https://github.com/linchengzzz)! - Added Manta Pacific Mainnet & Testnet

## 1.17.1

### Patch Changes

- [#1391](https://github.com/wevm/viem/pull/1391) [`437c0e5a`](https://github.com/wevm/viem/commit/437c0e5a023bc551c35e5a65da6f2a6a2e409bd7) Thanks [@IsabellaSmallcombe](https://github.com/IsabellaSmallcombe)! - Add Zora Sepolia Testnet

- [#1386](https://github.com/wevm/viem/pull/1386) [`fad9dc12`](https://github.com/wevm/viem/commit/fad9dc12eef2c7042db75a9ffa8f6e98e9e8f884) Thanks [@POKENA7](https://github.com/POKENA7)! - Added Astar zkEVM testnet zKatana chain.

## 1.17.0

### Minor Changes

- [#1382](https://github.com/wevm/viem/pull/1382) [`5ac4a631`](https://github.com/wevm/viem/commit/5ac4a6316edb4076287fcb3c571066c39a917995) Thanks [@jxom](https://github.com/jxom)! - Added ability for Actions (i.e. `readContract`) to infer their internal/dependant Actions (i.e. `call`) from the optionally extended Client.

  For instance, if an extended Client has overridden the `call` Action, then the `readContract` Action will use that instead of Viem's internal `call` Action.

### Patch Changes

- [#1377](https://github.com/wevm/viem/pull/1377) [`592f03eb`](https://github.com/wevm/viem/commit/592f03eb3c4d9a3e23716682e0acf8cfa4e65106) Thanks [@okalenyk](https://github.com/okalenyk)! - Added `multicall3` contract to `modeTestnet` chain.

## 1.16.6

### Patch Changes

- [#1356](https://github.com/wevm/viem/pull/1356) [`0da9f886`](https://github.com/wevm/viem/commit/0da9f886124cea8f8e2f557de68bd94b96e53ac8) Thanks [@AmaxJ](https://github.com/AmaxJ)! - Removed trailing slash from arbiscan goerli blockexplorer url

- [`36ec87da`](https://github.com/wevm/viem/commit/36ec87da7f614f5c6ca9e632eb27f8d8d1bbfcdf) Thanks [@jxom](https://github.com/jxom)! - Modified `getAddresses` to be compatible with Local Accounts.

## 1.16.5

### Patch Changes

- [#1347](https://github.com/wevm/viem/pull/1347) [`541bd152`](https://github.com/wevm/viem/commit/541bd1528d3fb43edfd713e3dd89f30803a37f97) Thanks [@lukasrosario](https://github.com/lukasrosario)! - Added Base Sepolia

- [#1339](https://github.com/wevm/viem/pull/1339) [`b7ddaf61`](https://github.com/wevm/viem/commit/b7ddaf61d6a392a8fa6f4550afa505f75c31eca4) Thanks [@jxom](https://github.com/jxom)! - Fixed topics mismatch in `decodeEventLogs` strict mode.

- [`b6aace90`](https://github.com/wevm/viem/commit/b6aace909c8f27c49a393813e2569b98a72083ca) Thanks [@jxom](https://github.com/jxom)! - Fixed `chainId` assignment in `signTransaction` action.

## 1.16.4

### Patch Changes

- [#1334](https://github.com/wevm/viem/pull/1334) [`4862acc5`](https://github.com/wevm/viem/commit/4862acc51ee86ceddfa55b21bb55667cf10e86a8) Thanks [@izayl](https://github.com/izayl)! - Added Scroll chain

## 1.16.3

### Patch Changes

- [`1e13ae83`](https://github.com/wevm/viem/commit/1e13ae83194da4ca6d829dfd63dd84b11719f497) Thanks [@jxom](https://github.com/jxom)! - Updated holesky RPC URLs.

- [#1330](https://github.com/wevm/viem/pull/1330) [`05a3784a`](https://github.com/wevm/viem/commit/05a3784a1587cc811fb15cb5b177bf90e123a5a1) Thanks [@holic](https://github.com/holic)! - Fixed `TransactionReceipt['logs']` type.

## 1.16.2

### Patch Changes

- [#1325](https://github.com/wevm/viem/pull/1325) [`e9a54192`](https://github.com/wevm/viem/commit/e9a54192c5a52db1c0452b08192171bc9304bec7) Thanks [@avasisht23](https://github.com/avasisht23)! - Exported `HttpTransportConfig`.

- [`c445acee`](https://github.com/wevm/viem/commit/c445acee5a3e3a4121521b7e289a9afd882b7400) Thanks [@jxom](https://github.com/jxom)! - Added `fetchOptions` to `http` transport return value.

## 1.16.1

### Patch Changes

- [`fda328d2`](https://github.com/wevm/viem/commit/fda328d26b86f5e2a2d56c898db12eea4e0e1e94) Thanks [@jxom](https://github.com/jxom)! - Updated `isows`.

## 1.16.0

### Minor Changes

- [#1316](https://github.com/wevm/viem/pull/1316) [`ae5c03ad`](https://github.com/wevm/viem/commit/ae5c03ada92968a6835705fd8017e0a687947152) Thanks [@jxom](https://github.com/jxom)! - Added `getProof`.

- [`d27e9943`](https://github.com/wevm/viem/commit/d27e994361180579fc8e6328ade3dbaf26963803) Thanks [@jxom](https://github.com/jxom)! - Added `withdrawals` & `withdrawalsRoot` to `Block` type.

## 1.15.5

### Patch Changes

- [#1312](https://github.com/wevm/viem/pull/1312) [`d7cff6a3`](https://github.com/wevm/viem/commit/d7cff6a368e3934874c5be406354226e9f786d38) Thanks [@jxom](https://github.com/jxom)! - Migrated to [isows](https://github.com/wevm/isows).

## 1.15.4

### Patch Changes

- [#1297](https://github.com/wevm/viem/pull/1297) [`aaaff980`](https://github.com/wevm/viem/commit/aaaff980569f5e8681a41737531d02fb97c3b788) Thanks [@jxom](https://github.com/jxom)! - Added `null` as a valid value on `TransactionRequestBase['to']` type.

- [#1295](https://github.com/wevm/viem/pull/1295) [`a46a52a7`](https://github.com/wevm/viem/commit/a46a52a71fbd0e904ce74b0f46683801489bc208) Thanks [@akshatmittal](https://github.com/akshatmittal)! - Added Infura Endpoints for Base

## 1.15.3

### Patch Changes

- [`1b159096`](https://github.com/wevm/viem/commit/1b159096e9727d626410feb58fa6f95a29ba1e9f) Thanks [@jxom](https://github.com/jxom)! - Added ignore glob for snapshots.

## 1.15.2

### Patch Changes

- [`fddaf719`](https://github.com/wevm/viem/commit/fddaf719ac320b8e025693ee9a06815639f95034) Thanks [@jxom](https://github.com/jxom)! - Fixed `getContract` types.

## 1.15.1

### Patch Changes

- [`a9f07e80`](https://github.com/wevm/viem/commit/a9f07e80cacb76433c8ece683f8177a138ef1810) Thanks [@jxom](https://github.com/jxom)! - Removed `type` from `package.json`.

## 1.15.0

### Minor Changes

- [#1260](https://github.com/wevm/viem/pull/1260) [`408ebf49`](https://github.com/wevm/viem/commit/408ebf49f852ae87438946ae24425cd631c722c5) Thanks [@izayl](https://github.com/izayl)! - Added utilities for EIP-2098 Compact Signatures:
  - `compactSignatureToHex`,
  - `compactSignatureToSignature`,
  - `hexToCompactSignature`,
  - `signatureToCompactSignature`

### Patch Changes

- [#1273](https://github.com/wevm/viem/pull/1273) [`822bc222`](https://github.com/wevm/viem/commit/822bc2223d95db51e94b226bca0be468ed5150c7) Thanks [@LiorAgnin](https://github.com/LiorAgnin)! - Updated Fuse RPC URL & added multicall3 contract address.

- [#1277](https://github.com/wevm/viem/pull/1277) [`ba7a7465`](https://github.com/wevm/viem/commit/ba7a7465621585412875d5f28699db2d4b6a59c8) Thanks [@witem](https://github.com/witem)! - Removed `type` field from `package.json`

- [#1278](https://github.com/wevm/viem/pull/1278) [`220d211f`](https://github.com/wevm/viem/commit/220d211fa92ca667d0b8e432071ead27df682d96) Thanks [@jaybuidl](https://github.com/jaybuidl)! - Added Arbitrum Sepolia chain.

## 1.14.0

### Minor Changes

- [#1263](https://github.com/wevm/viem/pull/1263) [`399a43db`](https://github.com/wevm/viem/commit/399a43db5e559cd84dafb5c66bfe0a7ad24c2d67) Thanks [@jxom](https://github.com/jxom)! - Added error types for exported modules (e.g. `<Module>ErrorType`). [Read more.](https://viem.sh/docs/error-handling)

### Patch Changes

- [`52c4c001`](https://github.com/wevm/viem/commit/52c4c0016a702bdacfb7de69c3f01d62de9af4db) Thanks [@jxom](https://github.com/jxom)! - Fixed typo in `hexToBigInt` export.

## 1.13.2

### Patch Changes

- [#1265](https://github.com/wevm/viem/pull/1265) [`3fd1e788`](https://github.com/wevm/viem/commit/3fd1e788f2f3a82c943e58fc77a3dc5da1f798cf) Thanks [@mcdee](https://github.com/mcdee)! - Added multicall3 for holesky

## 1.13.1

### Patch Changes

- [`61ef4d22`](https://github.com/wevm/viem/commit/61ef4d224c860e99f3ac82adb8e4c767a77b6dc0) Thanks [@jxom](https://github.com/jxom)! - Fixed `interval` parameter for Hardhat.

## 1.13.0

### Minor Changes

- [#1249](https://github.com/wevm/viem/pull/1249) [`42279c90`](https://github.com/wevm/viem/commit/42279c90543616248632be45279d12f4167ae8d8) Thanks [@paulmillr](https://github.com/paulmillr)! - Refactored `hexToBytes` to be up to 6x more performant.

- [#1215](https://github.com/wevm/viem/pull/1215) [`6a65c5a3`](https://github.com/wevm/viem/commit/6a65c5a3c285ea8c7c110659aac4be24cb09c483) Thanks [@jxom](https://github.com/jxom)! - Refactored RLP coding to be up to ~300x more performant.

### Patch Changes

- [#1255](https://github.com/wevm/viem/pull/1255) [`3d3337e3`](https://github.com/wevm/viem/commit/3d3337e303e407e6983fb99f0a28bc7521dc4a87) Thanks [@CJskii](https://github.com/CJskii)! - Added Core Dao chain

## 1.12.2

### Patch Changes

- [#1244](https://github.com/wevm/viem/pull/1244) [`6fd51b2f`](https://github.com/wevm/viem/commit/6fd51b2f491e898f89b04f2c5ed1052befe5133d) Thanks [@rkalis](https://github.com/rkalis)! - Added optional `bytecodeHash` parameter to `getContractAddress`.

## 1.12.1

### Patch Changes

- [#1242](https://github.com/wevm/viem/pull/1242) [`44367dbe`](https://github.com/wevm/viem/commit/44367dbe921cfd12a45d78744758474b67d28791) Thanks [@gymnasy55](https://github.com/gymnasy55)! - Fixed Sepolia multicall3 block created.

## 1.12.0

### Minor Changes

- [#1235](https://github.com/wevm/viem/pull/1235) [`b272af50`](https://github.com/wevm/viem/commit/b272af507257ed69af3b4cbb5614880ddb0f5ec4) Thanks [@jxom](https://github.com/jxom)! - Added `getContractEvents`.

## 1.11.1

### Patch Changes

- [#1234](https://github.com/wevm/viem/pull/1234) [`1b9d5ecd`](https://github.com/wevm/viem/commit/1b9d5ecdcbcf8fec0a6fd0f135936b626bef5184) Thanks [@eshaben](https://github.com/eshaben)! - Added Moonbeam development chain.

## 1.11.0

### Minor Changes

- [#1162](https://github.com/wevm/viem/pull/1162) [`8ac2c93d`](https://github.com/wevm/viem/commit/8ac2c93d2e04f843aee7fc1494967fb35a4dcc66) Thanks [@volkyeth](https://github.com/volkyeth)! - Added `getFunctionSignature` and `getEventSignature`.

### Patch Changes

- [#1221](https://github.com/wevm/viem/pull/1221) [`cf4006f7`](https://github.com/wevm/viem/commit/cf4006f799bdccfbf5765927a9fde0c20cbd1890) Thanks [@nitaliano](https://github.com/nitaliano)! - Added OP Sepolia

## 1.10.14

### Patch Changes

- [#1208](https://github.com/wevm/viem/pull/1208) [`728eb8b4`](https://github.com/wevm/viem/commit/728eb8b42f04b4587356c124140299c4879bd2e7) Thanks [@afa7789](https://github.com/afa7789)! - Added Kroma and Kroma Sepolia chains.

## 1.10.13

### Patch Changes

- [`f0708c13`](https://github.com/wevm/viem/commit/f0708c13b231678fb0abb56b23f8247baa9e3235) Thanks [@jxom](https://github.com/jxom)! - Migrated back to `isomorphic-ws`.

- [#1204](https://github.com/wevm/viem/pull/1204) [`353d28d4`](https://github.com/wevm/viem/commit/353d28d457c662a9c349bd323e3a1616cc9531eb) Thanks [@mcdee](https://github.com/mcdee)! - Added Holesky chain.

## 1.10.12

### Patch Changes

- [`165229e9`](https://github.com/wevm/viem/commit/165229e96a3fa0969adb2a2f171de968a3b4f393) Thanks [@jxom](https://github.com/jxom)! - Fixed `viem/window` entrypoint.

## 1.10.11

### Patch Changes

- [#1197](https://github.com/wevm/viem/pull/1197) [`d1fc5fe0`](https://github.com/wevm/viem/commit/d1fc5fe01dc14648a628b17606200ed343ef93f6) Thanks [@jxom](https://github.com/jxom)! - Fixed proxy packages.

## 1.10.10

### Patch Changes

- [`fa2d8794`](https://github.com/wevm/viem/commit/fa2d87942f792ee3b87c9ac291c2c82f8c2fc313) Thanks [@jxom](https://github.com/jxom)! - Fixed an issue where `waitForTransactionReceipt` would throw an error if `receipt.blockNumber` was undefined.

- [#1194](https://github.com/wevm/viem/pull/1194) [`347b1f40`](https://github.com/wevm/viem/commit/347b1f40702c50745e1f0cc493d52eaee6f405eb) Thanks [@jxom](https://github.com/jxom)! - Fixed `baseFeeMultiplier` calculation.

## 1.10.9

### Patch Changes

- [#1182](https://github.com/wevm/viem/pull/1182) [`5f048586`](https://github.com/wevm/viem/commit/5f0485869edd55605544c56c07258c8a4dcb2800) Thanks [@MarcusWentz](https://github.com/MarcusWentz)! - Added Chain: Taiko Jolnir L2.

- [#1175](https://github.com/wevm/viem/pull/1175) [`d6972937`](https://github.com/wevm/viem/commit/d69729375a31fdfa7d92d33ed50d21e954b671f3) Thanks [@avasisht23](https://github.com/avasisht23)! - Added Alchemy RPC URLs for Base chain.

## 1.10.8

### Patch Changes

- [#1177](https://github.com/wevm/viem/pull/1177) [`8d05e410`](https://github.com/wevm/viem/commit/8d05e410e1db43cbcddab2741e1f7dc22b5ffbec) Thanks [@jxom](https://github.com/jxom)! - Fixed an issue where some environments would throw `WebSocket.default is not a constructor`.

## 1.10.7

### Patch Changes

- [#1169](https://github.com/wevm/viem/pull/1169) [`eb37c760`](https://github.com/wevm/viem/commit/eb37c76077141e1288d1de372ffc6fc62654c322) Thanks [@Songkeys](https://github.com/Songkeys)! - Updated multicall3 address on Crossbell.

- [#1170](https://github.com/wevm/viem/pull/1170) [`828f48e3`](https://github.com/wevm/viem/commit/828f48e31e992c20c57f4e006e3ec3e8724da7df) Thanks [@jxom](https://github.com/jxom)! - Added `testnet` property to Gnosis Chiadao.

## 1.10.6

### Patch Changes

- [#1166](https://github.com/wevm/viem/pull/1166) [`d828894a`](https://github.com/wevm/viem/commit/d828894abedcd4eb8a35f04825858f27140fbe2c) Thanks [@jxom](https://github.com/jxom)! - Updated Polygon Mumbai RPC URL.

## 1.10.5

### Patch Changes

- [`8fe2467b`](https://github.com/wevm/viem/commit/8fe2467be17d09fb15a3eccc29f3155887d821af) Thanks [@jxom](https://github.com/jxom)! - Added `estimateFeesPerGas` and `estimateMaxPriorityFeePerGas` exports to `viem/actions`.

## 1.10.4

### Patch Changes

- [#1153](https://github.com/wevm/viem/pull/1153) [`040dda64`](https://github.com/wevm/viem/commit/040dda64340fd70602d951efea1454afe9e7c198) Thanks [@vmichalik](https://github.com/vmichalik)! - Updated Polygon Mumbai RPC URL.

## 1.10.3

### Patch Changes

- [#1147](https://github.com/wevm/viem/pull/1147) [`5001e9f7`](https://github.com/wevm/viem/commit/5001e9f72cada8be8fed8c858c37d59d1bea8425) Thanks [@holic](https://github.com/holic)! - Fixed `encodePacked` for empty arrays.

## 1.10.2

### Patch Changes

- [#1145](https://github.com/wevm/viem/pull/1145) [`eac50a51`](https://github.com/wevm/viem/commit/eac50a5138f9e2078e99abda02a9c3468bcd195b) Thanks [@jxom](https://github.com/jxom)! - Support function/event selectors as `name` in `getAbiItem`.

- [#1146](https://github.com/wevm/viem/pull/1146) [`4875a2af`](https://github.com/wevm/viem/commit/4875a2aff987709f3f94287d9f77895ec99d9590) Thanks [@darrenvechain](https://github.com/darrenvechain)! - Added Vechain chain.

## 1.10.1

### Patch Changes

- [`bf2f7ee1`](https://github.com/wevm/viem/commit/bf2f7ee124af5eb43f0541200e88bd4302680912) Thanks [@jxom](https://github.com/jxom)! - Updated dependencies:
  - `@adraffy/ens-normalize`
  - `@noble/curves`
  - `@noble/hashes`
  - `@scure/bip32`
  - `@scure/bip39`
  - `abitype`
  - `isomorphic-ws`
  - `ws`

## 1.10.0

### Minor Changes

- [#1110](https://github.com/wevm/viem/pull/1110) [`74c7d276`](https://github.com/wevm/viem/commit/74c7d276305d4e3db4a4902c247e191ead369abd) Thanks [@jxom](https://github.com/jxom)! - Amended `Chain` type to allow arbitrary `contracts` (as well as contracts that could be dependant on chain).

- [#1136](https://github.com/wevm/viem/pull/1136) [`16699c8c`](https://github.com/wevm/viem/commit/16699c8c92faccecc4dbd3353879ce5a512bbb35) Thanks [@jxom](https://github.com/jxom)! - Handle CAIP-25 "User Rejected" errors.

- [#1120](https://github.com/wevm/viem/pull/1120) [`0e4d9320`](https://github.com/wevm/viem/commit/0e4d932079a449fb7268c24eb0f6391e7b05076c) Thanks [@polygomic](https://github.com/polygomic)! - Added Plinga chain

- [#1108](https://github.com/wevm/viem/pull/1108) [`2327aa07`](https://github.com/wevm/viem/commit/2327aa0741bac51058d7038840bdc2895ead5456) Thanks [@simonzg](https://github.com/simonzg)! - Added Meter chain and Meter Testnet chain

- [#1128](https://github.com/wevm/viem/pull/1128) [`e1728054`](https://github.com/wevm/viem/commit/e17280544dc113c855166dae0ee634890c8a4e96) Thanks [@karangoraniya](https://github.com/karangoraniya)! - Added opBNB Mainnet and Testnet chains.

- [#1117](https://github.com/wevm/viem/pull/1117) [`a637ba2b`](https://github.com/wevm/viem/commit/a637ba2b5fc1ffacc1f483ea4be0121528faf3f4) Thanks [@rkalis](https://github.com/rkalis)! - Added `domainSeparator` to calculate domain separator from an EIP712 domain.

### Patch Changes

- [#1137](https://github.com/wevm/viem/pull/1137) [`4159c997`](https://github.com/wevm/viem/commit/4159c9979788798cca6ebb48f38e2284559850ff) Thanks [@jxom](https://github.com/jxom)! - Fixed an issue where non-standard "user rejected" errors where being coalesced into an `UnknownNodeError`.

- [`8605c1f1`](https://github.com/wevm/viem/commit/8605c1f1d048a2d924bd8b83a42b8ce5b0e65900) Thanks [@jxom](https://github.com/jxom)! - Handle `-32603` RPC error codes when deriving a `ContractFunctionRevertedError`.

- [#1109](https://github.com/wevm/viem/pull/1109) [`0a242120`](https://github.com/wevm/viem/commit/0a2421204f3878e016502f7e2ec98d043ef88cf6) Thanks [@jxom](https://github.com/jxom)! - Removed hardcoded `defaultPriorityFee` on OP Stack chains in favor of fetching it from `eth_maxPriorityFeePerGas`.

- [#1112](https://github.com/wevm/viem/pull/1112) [`7da52244`](https://github.com/wevm/viem/commit/7da5224467ca5a6368f27734a01b56f53c2c0106) Thanks [@RexCloud](https://github.com/RexCloud)! - Added multicall3 for Scroll Sepolia

- [#1139](https://github.com/wevm/viem/pull/1139) [`86230caf`](https://github.com/wevm/viem/commit/86230caf872f76975f7f6aaff53a9c9e3b8bfdc7) Thanks [@jxom](https://github.com/jxom)! - Fixed `VerifyMessageParameters` to accept a `raw` property.

- [#1138](https://github.com/wevm/viem/pull/1138) [`101c94f2`](https://github.com/wevm/viem/commit/101c94f2841056410ed4c32b76672f7fbd1ebabc) Thanks [@jxom](https://github.com/jxom)! - Amended Base chain `nativeCurreny.name` to "Ether".

- [#1048](https://github.com/wevm/viem/pull/1048) [`f33086ef`](https://github.com/wevm/viem/commit/f33086ef88a1c9650b2b0efa6a034490519eead8) Thanks [@brianathere](https://github.com/brianathere)! - Converted `isomorphic-ws` to a synchronous import.

## 1.9.5

### Patch Changes

- [#1105](https://github.com/wevm/viem/pull/1105) [`9661b9d8`](https://github.com/wevm/viem/commit/9661b9d8f4d747391f9ffb14b789c727a6831488) Thanks [@dschlabach](https://github.com/dschlabach)! - Added ENS Registry and ENS Universal Resolver for Sepolia.

- [#1102](https://github.com/wevm/viem/pull/1102) [`0edea858`](https://github.com/wevm/viem/commit/0edea858fe28bd9d7cb7c5b9b8ebde72025cf71d) Thanks [@rkalis](https://github.com/rkalis)! - Fixed bug regarding incorrect bigint->bytes32 conversion in hexToSignature

## 1.9.4

### Patch Changes

- [#1098](https://github.com/wevm/viem/pull/1098) [`970c0f53`](https://github.com/wevm/viem/commit/970c0f53043241360c108ee2f7c07dd2413ab233) Thanks [@Sz0x](https://github.com/Sz0x)! - Added account hoisting to `call`.

## 1.9.3

### Patch Changes

- [#1087](https://github.com/wevm/viem/pull/1087) [`ac3b7eab`](https://github.com/wevm/viem/commit/ac3b7eab194d541bcf54098bf22ab068ebfc642a) Thanks [@jxom](https://github.com/jxom)! - Append errors from `aggregate3` to return results if `allowFailure=true` instead of throwing an error.

## 1.9.2

### Patch Changes

- [`0b0167ef`](https://github.com/wevm/viem/commit/0b0167ef7ecdd11d59310d04cde3a074dcf5abcd) Thanks [@jxom](https://github.com/jxom)! - Fixed `PrepareTransactionRequestReturnType` type.

## 1.9.1

### Patch Changes

- [#1081](https://github.com/wevm/viem/pull/1081) [`29ba250f`](https://github.com/wevm/viem/commit/29ba250f19213348af28e535aac7df176f673ae0) Thanks [@witem](https://github.com/witem)! - Improved multicall performance.

## 1.9.0

### Minor Changes

- [`e14eeb3b`](https://github.com/wevm/viem/commit/e14eeb3bd287a45e0c4fbed81847f7477b3e80e6) Thanks [@jxom](https://github.com/jxom)! - Migrated `@wagmi/chains` into viem and removed the `@wagmi/chains` dependency.

## 1.8.1

### Patch Changes

- [#1072](https://github.com/wevm/viem/pull/1072) [`edf264f3`](https://github.com/wevm/viem/commit/edf264f385e1bb24d4f7b242d1446124a6d3fcb4) Thanks [@linchengzzz](https://github.com/linchengzzz)! - Added Linea chain.

## 1.8.0

### Minor Changes

- [#1058](https://github.com/wevm/viem/pull/1058) [`533b5900`](https://github.com/wevm/viem/commit/533b59006b3344b947485ef372f0c78b111f6dc3) Thanks [@jxom](https://github.com/jxom)! - Added `prepareTransactionRequest`, `signTransaction`, and `sendRawTransaction`.

## 1.7.1

### Patch Changes

- [`da45ec2d`](https://github.com/wevm/viem/commit/da45ec2d519ccabef5eef0c4bc8efae05c12bcb3) Thanks [@jxom](https://github.com/jxom)! - Deduped block retrieval in `estimateMaxPriorityFeePerGas`.

## 1.7.0

### Minor Changes

- [#1044](https://github.com/wevm/viem/pull/1044) [`3daedbf5`](https://github.com/wevm/viem/commit/3daedbf50828c4ea01c5096a05d94e8c7205644f) Thanks [@jxom](https://github.com/jxom)! - Added `estimateFeesPerGas` & `estimateMaxPriorityFeesPerGas` Actions.

- [#1044](https://github.com/wevm/viem/pull/1044) [`3daedbf5`](https://github.com/wevm/viem/commit/3daedbf50828c4ea01c5096a05d94e8c7205644f) Thanks [@jxom](https://github.com/jxom)! - Added `estimateFeesPerGas` & `baseFeeMultiplier` to the Chain Fees configuration (`chain.fees`).

## 1.6.6

### Patch Changes

- [#1035](https://github.com/wevm/viem/pull/1035) [`7981fa99`](https://github.com/wevm/viem/commit/7981fa994d092f7f638c5a627cb009b8e5a23883) Thanks [@aaronmgdr](https://github.com/aaronmgdr)! - Added `parseTransactionCelo` to the `viem/chains/utils` entrypoint.

## 1.6.5

### Patch Changes

- [#1041](https://github.com/wevm/viem/pull/1041) [`fa3353e9`](https://github.com/wevm/viem/commit/fa3353e9de1b27d8471531f1c4d35e7f34f7ef39) Thanks [@jxom](https://github.com/jxom)! - Fixed WebSocket instantiation in React Native environment.

## 1.6.4

### Patch Changes

- [#1040](https://github.com/wevm/viem/pull/1040) [`1e5bd4a0`](https://github.com/wevm/viem/commit/1e5bd4a000f8e8ebdb71674bca26cfb51eb8f275) Thanks [@jxom](https://github.com/jxom)! - Made `value` optional on `writeContract`/`simulateContract` for `payable` functions.

- [#1022](https://github.com/wevm/viem/pull/1022) [`2eb56bc7`](https://github.com/wevm/viem/commit/2eb56bc7df4094b1b92f31ad926e72271ff27add) Thanks [@Songkeys](https://github.com/Songkeys)! - Fixed an issue where `waitForTransactionReceipt` would be infinitely pending when an error is thrown after a transaction has been replaced.

## 1.6.3

### Patch Changes

- [#1013](https://github.com/wevm/viem/pull/1013) [`dd1e1028`](https://github.com/wevm/viem/commit/dd1e102874ef006d55d286b622e74e5d210c2293) Thanks [@avasisht23](https://github.com/avasisht23)! - Added `EIP1193EventMap` type.

- [#1033](https://github.com/wevm/viem/pull/1033) [`51ccc6c9`](https://github.com/wevm/viem/commit/51ccc6c9453538b98e7e580cec44d9b15f0d3500) Thanks [@skeithc](https://github.com/skeithc)! - Fixed `getEnsAddress` for addresses that start with `0`.

## 1.6.2

### Patch Changes

- [#1028](https://github.com/wevm/viem/pull/1028) [`b8fa9b4e`](https://github.com/wevm/viem/commit/b8fa9b4e553b8a1568a19bf995af3d496f126245) Thanks [@tmm](https://github.com/tmm)! - Fixed TypeScript 5.1.6 support

- [`1a30f344`](https://github.com/wevm/viem/commit/1a30f344fe061a5d6b8314d8ee9b17856bc711e4) Thanks [@jxom](https://github.com/jxom)! - Fixed number constants.

## 1.6.1

### Patch Changes

- [#1011](https://github.com/wevm/viem/pull/1011) [`582cb017`](https://github.com/wevm/viem/commit/582cb0170def5c5077dca2f96034eba11f09ec88) Thanks [@dghelm](https://github.com/dghelm)! - Added Scroll Sepolia testnet

## 1.6.0

### Minor Changes

- [#984](https://github.com/wevm/viem/pull/984) [`e1032c7b`](https://github.com/wevm/viem/commit/e1032c7bd9effb3fb0d57ebf90cdd37c7e1c06c1) Thanks [@holic](https://github.com/holic)! - Added `signTransaction` & `privateKeyToAddress` exports to `viem/accounts` entrypoint.

- [#1006](https://github.com/wevm/viem/pull/1006) [`7311e201`](https://github.com/wevm/viem/commit/7311e201d273776d93471f459f55dd598a4f6e52) Thanks [@jxom](https://github.com/jxom)! - Added `fees` to `chain` config that includes a `defaultPriorityFee` for setting a default priority fee (`maxPriorityFeePerGas`) for a chain.

  ```ts
  import type { Chain } from 'viem'

  export const example = {
    // ...
    fees: {
      defaultPriorityFee: 1_000_000n, // 0.001 gwei
      // or
      async defaultPriorityFee() {
        // ... some async behavior to derive the fee.
      }
    },
    // ...
  } as const satifies Chain
  ```

- [#886](https://github.com/wevm/viem/pull/886) [`fef66bfb`](https://github.com/wevm/viem/commit/fef66bfbb9d0c9a94f3f607867738432bcbfef85) Thanks [@jxom](https://github.com/jxom)! - Added formatter for Optimism transaction receipts (format `l1GasPrice`, `l1GasUsed`, etc).

- [#886](https://github.com/wevm/viem/pull/886) [`fef66bfb`](https://github.com/wevm/viem/commit/fef66bfbb9d0c9a94f3f607867738432bcbfef85) Thanks [@jxom](https://github.com/jxom)! - Added entrypoints for chain utilities (`viem/chains/utils`) with exports for chain-specific chains, formatters, serializers, and types.

  Examples:

  ```ts
  import {
    type CeloBlock,
    type CeloTransaction,
    type OptimismBlock,
    type OptimismTransaction,
    serializeTransactionCelo,
  } from "viem/chains/utils";
  ```

### Patch Changes

- [`99332168`](https://github.com/wevm/viem/commit/993321689b3e2220976504e7e170fe47731297ce) Thanks [@jxom](https://github.com/jxom)! - Updated `@noble/curves`

- [#1008](https://github.com/wevm/viem/pull/1008) [`9d93953f`](https://github.com/wevm/viem/commit/9d93953ffc66d70ccbe7e05862edfeadb1334a9e) Thanks [@holic](https://github.com/holic)! - Added `"already known"` as a node message matcher to `NonceTooLowError`.

## 1.5.4

### Patch Changes

- [#1000](https://github.com/wevm/viem/pull/1000) [`4bdbf15b`](https://github.com/wevm/viem/commit/4bdbf15be0d61b52a195e11c97201e707fb616cc) Thanks [@jxom](https://github.com/jxom)! - Fixed `docsPath` value in `estimateContractGas`.

- [#999](https://github.com/wevm/viem/pull/999) [`de94d81f`](https://github.com/wevm/viem/commit/de94d81f41689ae9155c1295c8f7b80e4a7c9540) Thanks [@jxom](https://github.com/jxom)! - Support passing `gasPrice` for chains that include `baseFeePerGas` but do not support EIP-1559 Transactions (e.g. BSC).

## 1.5.3

### Patch Changes

- [`ae4ab844`](https://github.com/wevm/viem/commit/ae4ab8442fcdaa073a98a71599762a1cb54c3cf0) Thanks [@jxom](https://github.com/jxom)! - Fixed performance bottleneck in ABI encoding for dynamic bytes.

## 1.5.2

### Patch Changes

- [#974](https://github.com/wevm/viem/pull/974) [`11410bab`](https://github.com/wevm/viem/commit/11410bab795c390734adab093ab78da127fb68c4) Thanks [@jxom](https://github.com/jxom)! - Fixed issue where `getFunctionSelector` & `getEventSelector` were returning incorrect selectors for tuple parameters.

## 1.5.1

### Patch Changes

- [#954](https://github.com/wevm/viem/pull/954) [`e98e2651`](https://github.com/wevm/viem/commit/e98e2651528e015a62a8c1181a66060dd155124e) Thanks [@jaxernst](https://github.com/jaxernst)! - Added filter reinitialization logic for `watchContractEvent` and `watchEvent` for when a filter has been uninstalled.

- [#967](https://github.com/wevm/viem/pull/967) [`eb8954a0`](https://github.com/wevm/viem/commit/eb8954a003a198b843835231cb406e88ffccf1d1) Thanks [@Zil-B](https://github.com/Zil-B)! - Moved `@types/ws` into dependencies to fix an issue where required runtime types weren't being exported.

## 1.5.0

### Minor Changes

- [#847](https://github.com/wevm/viem/pull/847) [`1e5d4545`](https://github.com/wevm/viem/commit/1e5d4545736282c2d8dedb38907f2433ce1c72f4) Thanks [@jxom](https://github.com/jxom)! - Narrowed `getBlock`, `watchBlocks`, `getFilterChanges`, `getFilterLogs` & `getLogs` return types for when `blockTag` or `includeTransactions` is provided.
  - When `blockTag !== 'pending'`, the return type will now include some non-nullish properties if it were dependent on pending blocks. Example: For `getBlock`, the `block.number` type is now non-nullish since `blockTag !== 'pending'`.
  - On the other hand, when `blockTag: 'pending'`, some properties will be nullish. Example: For `getBlock`, the `block.number` type is now `null` since `blockTag === 'pending'`.
  - When `includeTransactions` is provided, the return type of will narrow the `transactions` property type. Example: `block.transactions` will be `Transaction[]` when `includeTransactions: true` instead of `Hash[] | Transaction[]`.

  TLDR;

  ```ts
  // Before
  const block = publicClient.getBlock({ includeTransactions: true });
  block.transactions;
  //    ^? Hash[] | Transaction[]
  block.transactions[0].blockNumber;
  //                    ^? bigint | null

  // After
  const block = publicClient.getBlock({ includeTransactions: true });
  block.transactions;
  //    ^? Transaction[]
  block.transactions[0].blockNumber;
  //                    ^? bigint

  // Before
  const block = publicClient.getBlock({
    blockTag: "pending",
    includeTransactions: true,
  });
  block.number;
  //    ^? number | null
  block.transactions[0].blockNumber;
  //                    ^? bigint | null

  // After
  const block = publicClient.getBlock({
    blockTag: "pending",
    includeTransactions: true,
  });
  block.number;
  //    ^? null
  block.transactions[0].blockNumber;
  //                    ^? null
  ```

- [#847](https://github.com/wevm/viem/pull/847) [`1e5d4545`](https://github.com/wevm/viem/commit/1e5d4545736282c2d8dedb38907f2433ce1c72f4) Thanks [@jxom](https://github.com/jxom)! - **Type Change**: `TPending` has been added to slot 2 of the `Log` generics.

  ```diff
  type Log<
    TQuantity = bigint,
    TIndex = number,
  + TPending extends boolean = boolean,
    TAbiEvent extends AbiEvent | undefined = undefined,
    TStrict extends boolean | undefined = undefined,
    TAbi extends Abi | readonly unknown[] = [TAbiEvent],
    TEventName extends string | undefined = TAbiEvent extends AbiEvent
      ? TAbiEvent['name']
      : undefined,
  >
  ```

- [#958](https://github.com/wevm/viem/pull/958) [`f7976fd0`](https://github.com/wevm/viem/commit/f7976fd0486079247a76ff3d3cecfbc2f6f2dae9) Thanks [@jxom](https://github.com/jxom)! - Added `cacheTime` as a parameter to `getBlockNumber` & `createClient`.

- [`28a82125`](https://github.com/wevm/viem/commit/28a82125f2678ed6ceb3bfaab065bfb9ffc8a367) Thanks [@jxom](https://github.com/jxom)! - Exported number constants (ie. `maxInt128`, `maxUint256`, etc).

- [#951](https://github.com/wevm/viem/pull/951) [`c75d3b60`](https://github.com/wevm/viem/commit/c75d3b60fbacaf4d3ff23460e91dc2b75baed15d) Thanks [@jxom](https://github.com/jxom)! - Added support for multiple `events` on Filters/Log Actions:
  - `createEventFilter`
  - `getLogs`
  - `watchEvent`

  Example:

  ```ts
  import { parseAbi } from "viem";
  import { publicClient } from "./client";

  const logs = publicClient.getLogs({
    events: parseAbi([
      "event Approval(address indexed owner, address indexed sender, uint256 value)",
      "event Transfer(address indexed from, address indexed to, uint256 value)",
    ]),
  });
  ```

- [#957](https://github.com/wevm/viem/pull/957) [`7950df80`](https://github.com/wevm/viem/commit/7950df80c2416772861b7fc99a6d40095725b87c) Thanks [@jxom](https://github.com/jxom)! - Added `hexToSignature` & `signatureToHex`.

- [#847](https://github.com/wevm/viem/pull/847) [`1e5d4545`](https://github.com/wevm/viem/commit/1e5d4545736282c2d8dedb38907f2433ce1c72f4) Thanks [@jxom](https://github.com/jxom)! - **Type Change**: `TIncludeTransactions` & `TBlockTag` has been added to slot 1 & 2 of the `Block` generics.

  ```diff
  type Block<
    TQuantity = bigint,
  + TIncludeTransactions extends boolean = boolean,
  + TBlockTag extends BlockTag = BlockTag,
    TTransaction = Transaction<
      bigint,
      number,
      TBlockTag extends 'pending' ? true : false
    >,
  >
  ```

## 1.4.2

### Patch Changes

- [#941](https://github.com/wevm/viem/pull/941) [`12c685a1`](https://github.com/wevm/viem/commit/12c685a1adc5ab4531d3084cdfa9e281456c4793) Thanks [@jxom](https://github.com/jxom)! - Capture error signatures that do not exist on the ABI in `ContractFunctionRevertedError`.

- [#942](https://github.com/wevm/viem/pull/942) [`e26e356c`](https://github.com/wevm/viem/commit/e26e356cf43618af23a9a67ee5eaa897921d4160) Thanks [@alexfertel](https://github.com/alexfertel)! - Deprecated `OnLogParameter` & `OnLogFn` in favor of `WatchEventOnLogParameter` & `WatchEventOnLogFn` types.
  Added `WatchContractEventOnLogParameter` & `WatchContractEventOnLogFn` types.

## 1.4.1

### Patch Changes

- [`789592dc`](https://github.com/wevm/viem/commit/789592dc5d4ca264f2ef4f3f0f4fa721fb9522fc) Thanks [@jxom](https://github.com/jxom)! - Fixed an issue where calling `encodePacked` with an empty `bytes[]` array would return an `Uint8Array` instead of `Hex` value.

- [#922](https://github.com/wevm/viem/pull/922) [`71c9c933`](https://github.com/wevm/viem/commit/71c9c9338904d142248a32f1acd99ea25a6e6e58) Thanks [@mikemcdonald](https://github.com/mikemcdonald)! - Fixed an issue where `parseUnits` would throw `Cannot convert to a BigInt` for large numbers with a fraction component.

## 1.4.0

### Minor Changes

- [#908](https://github.com/wevm/viem/pull/908) [`988c65f8`](https://github.com/wevm/viem/commit/988c65f8218c9ce0549c04b3779efb5f685da75f) Thanks [@moldy530](https://github.com/moldy530)! - Added coin type support for `getEnsAddress`.

### Patch Changes

- [#878](https://github.com/wevm/viem/pull/878) [`4e227303`](https://github.com/wevm/viem/commit/4e2273036f8bbc7973b13467d7cb9baa2f17a460) Thanks [@salieflewis](https://github.com/salieflewis)! - Exported `Filter` type.

## 1.3.1

### Patch Changes

- [#907](https://github.com/wevm/viem/pull/907) [`319cdb61`](https://github.com/wevm/viem/commit/319cdb615f0ac6cff0385bb371be9a7da51abe80) Thanks [@Raiden1411](https://github.com/Raiden1411)! - Updated `abitype` to 0.9.3

## 1.3.0

### Minor Changes

- [`30a88482`](https://github.com/wevm/viem/commit/30a88482d541a346990eac9630b7fa1f1550c90a) Thanks [@jxom](https://github.com/jxom)! - Added chains:
  - `base`
  - `mev`
  - `mevTestnet`

## 1.2.15

### Patch Changes

- [#885](https://github.com/wevm/viem/pull/885) [`020c744d`](https://github.com/wevm/viem/commit/020c744d85e4150b4248407eae8a52ce390cfa9d) Thanks [@TateB](https://github.com/TateB)! - Added `null` resolver check to ENS Actions.

## 1.2.14

### Patch Changes

- [#883](https://github.com/wevm/viem/pull/883) [`ad96d39f`](https://github.com/wevm/viem/commit/ad96d39f6c9266dc6965013e255990952fa9323d) Thanks [@tmm](https://github.com/tmm)! - Exported missing types

## 1.2.13

### Patch Changes

- [#874](https://github.com/wevm/viem/pull/874) [`a9bc9f6d`](https://github.com/wevm/viem/commit/a9bc9f6d182052a536e51dc6fa75afda91de331a) Thanks [@Alexsey](https://github.com/Alexsey)! - Fixed `BaseError.walk` to return `null` if the predicate callback is not satisfied.

## 1.2.12

### Patch Changes

- [#864](https://github.com/wevm/viem/pull/864) [`b851c41b`](https://github.com/wevm/viem/commit/b851c41b87dce60af6be1e518e3c7a1b16e99b63) Thanks [@jxom](https://github.com/jxom)! - Fixed an issue where `dataSuffix` was not being provided to the `request` returned from `simulateTransaction`.

## 1.2.11

### Minor Changes

- [#857](https://github.com/wevm/viem/pull/857) [`513a7b9a`](https://github.com/wevm/viem/commit/513a7b9a4c037591b0fe4dd4fb4364bf8fed9726) Thanks [@tmm](https://github.com/tmm)! - Prettify-ed client types

## 1.2.10

### Patch Changes

- [#853](https://github.com/wevm/viem/pull/853) [`a955007e`](https://github.com/wevm/viem/commit/a955007e00f9076f4d2faefb5473df0fb968de8e) Thanks [@johngrantuk](https://github.com/johngrantuk)! - Allow using EIP-1559 transactions on chains with 0 base fee.

## 1.2.9

### Patch Changes

- [`d24e5bc4`](https://github.com/wevm/viem/commit/d24e5bc48100afb62a25c8515874be9fddb4c7c3) Thanks [@jxom](https://github.com/jxom)! - Fixed a race condition in `waitForTransactionReceipt` causing multiple parallel instances to not resolve.

## 1.2.8

### Patch Changes

- [#755](https://github.com/wevm/viem/pull/755) [`064cc09e`](https://github.com/wevm/viem/commit/064cc09e40dfb0b436b84c01aafdb448928153b3) Thanks [@aaronmgdr](https://github.com/aaronmgdr)! - Added serializer for Celo CIP-42 transactions.

- [#822](https://github.com/wevm/viem/pull/822) [`9a1e42bd`](https://github.com/wevm/viem/commit/9a1e42bd5d3ceef6527e04275499bef5ff4b4a39) Thanks [@RielJ](https://github.com/RielJ)! - Added ability to pass `value` to `deployContract`.

## 1.2.7

### Patch Changes

- [#825](https://github.com/wevm/viem/pull/825) [`d9e0a64c`](https://github.com/wevm/viem/commit/d9e0a64c30011d60f873008ec68baa324f70b7ad) Thanks [@tmm](https://github.com/tmm)! - Exported types.

- [#824](https://github.com/wevm/viem/pull/824) [`9dcec526`](https://github.com/wevm/viem/commit/9dcec5262c57085f6ff9f220471891e8805ba6b5) Thanks [@frangio](https://github.com/frangio)! - Added missing `package.json#peerDependenciesMeta`.

## 1.2.6

### Patch Changes

- [#808](https://github.com/wevm/viem/pull/808) [`7567f58e`](https://github.com/wevm/viem/commit/7567f58e808b5cf67e46c151bf0569a2820be7bd) Thanks [@jxom](https://github.com/jxom)! - Fixed `RpcTransaction` type to not include `typeHex`.

- [#808](https://github.com/wevm/viem/pull/808) [`7567f58e`](https://github.com/wevm/viem/commit/7567f58e808b5cf67e46c151bf0569a2820be7bd) Thanks [@jxom](https://github.com/jxom)! - Fixed an issue where `TransactionRequest` did not narrow based on type.

## 1.2.5

### Patch Changes

- [`81282fc1`](https://github.com/wevm/viem/commit/81282fc1d9cd4187e2caed051f221b2d4e57ec3a) Thanks [@jxom](https://github.com/jxom)! - Exported `signatureToHex`.

## 1.2.4

### Patch Changes

- [`11c844a1`](https://github.com/wevm/viem/commit/11c844a1804270bfafa903061d1f98605067203d) Thanks [@jxom](https://github.com/jxom)! - Exported `sign` in `viem/accounts`.

## 1.2.3

### Patch Changes

- [#802](https://github.com/wevm/viem/pull/802) [`b610634c`](https://github.com/wevm/viem/commit/b610634c62547178fe3737dbb37fb8db302e30c6) Thanks [@tmm](https://github.com/tmm)! - Bumped dependencies and exported types.

## 1.2.2

### Patch Changes

- [`5a8f59d5`](https://github.com/wevm/viem/commit/5a8f59d5e1d9df27c6897637346dbfe0bfcb2e62) Thanks [@tmm](https://github.com/tmm)! - Exported type

## 1.2.1

### Patch Changes

- [`96cb7534`](https://github.com/wevm/viem/commit/96cb7534c1be9ab635e70ad463551a29b7f2c553) Thanks [@jxom](https://github.com/jxom)! - Fixed multicall with ABI overrides.

## 1.2.0

### Minor Changes

- [#791](https://github.com/wevm/viem/pull/791) [`98fd9172`](https://github.com/wevm/viem/commit/98fd9172045c344429d5a716f497e422d85c0348) Thanks [@jxom](https://github.com/jxom)! - Implemented ability to "extend" Clients via `client.extend` & refactored Actions to accept a tree-shakable Client.

## 1.1.8

### Patch Changes

- [#783](https://github.com/wevm/viem/pull/783) [`91e85c76`](https://github.com/wevm/viem/commit/91e85c76df0ee665fb26dbadd473da5ec87e5029) Thanks [@izayl](https://github.com/izayl)! - Added a static `code` property to RPC Error classes.

## 1.1.7

### Patch Changes

- [`d0b4619e`](https://github.com/wevm/viem/commit/d0b4619e55ee697c9b8e03e9818b93c6a25b3ba2) Thanks [@jxom](https://github.com/jxom)! - Exported `decodeDeployData`.

## 1.1.6

### Patch Changes

- [`ec58ed1b`](https://github.com/wevm/viem/commit/ec58ed1b8be60973817ff401f1bf340fda854208) Thanks [@jxom](https://github.com/jxom)! - Fixed type narrowing on EIP1474 schemas

## 1.1.5

### Patch Changes

- [`c4e996b8`](https://github.com/wevm/viem/commit/c4e996b85404f4083e58c51ea98ac556d8ecd436) Thanks [@jxom](https://github.com/jxom)! - Fixed errorneous type defition being generated by `tsc`.

## 1.1.4

### Patch Changes

- [`75745a60`](https://github.com/wevm/viem/commit/75745a60fc83a13c3bec20ff04829b82d0852c07) Thanks [@jxom](https://github.com/jxom)! - Lax `parseUnits` value parameter.

## 1.1.3

### Patch Changes

- [#758](https://github.com/wevm/viem/pull/758) [`67b628df`](https://github.com/wevm/viem/commit/67b628df19edead79d8c6ef4755b407b3ce0486f) Thanks [@jxom](https://github.com/jxom)! - Added support for empty string in EIP712Domain name field.

## 1.1.2

### Patch Changes

- [`c974c25f`](https://github.com/wevm/viem/commit/c974c25ff28f9eec5bf5d4030146db2b215614d5) Thanks [@jxom](https://github.com/jxom)! - Added `zora` as a supported chain.

## 1.1.1

### Patch Changes

- [`5dd98d3e`](https://github.com/wevm/viem/commit/5dd98d3e57e993a7cae27030c8c10944cf5e204b) Thanks [@jxom](https://github.com/jxom)! - Exported `formatLog`

## 1.1.0

### Minor Changes

- [#691](https://github.com/wevm/viem/pull/691) [`6e65789f`](https://github.com/wevm/viem/commit/6e65789fb596ac3e64a9e5e7de1c18257fa50a59) Thanks [@aaronmgdr](https://github.com/aaronmgdr)! - Added custom chain serializers via `chain.serializers`.

- [#740](https://github.com/wevm/viem/pull/740) [`d435351d`](https://github.com/wevm/viem/commit/d435351d8637e096b1542da8bb1762858d006363) Thanks [@jxom](https://github.com/jxom)! - Added support for Optimism Deposit Transactions.

### Patch Changes

- [#709](https://github.com/wevm/viem/pull/709) [`043b2cba`](https://github.com/wevm/viem/commit/043b2cbaf8877ae67cf163d2ea19df9f08eb3808) Thanks [@jxom](https://github.com/jxom)! - Refactored serializable/serialized transaction types.

- [#735](https://github.com/wevm/viem/pull/735) [`e7ee66c8`](https://github.com/wevm/viem/commit/e7ee66c8f92262def25fe59403f19ecfbac47ad8) Thanks [@holic](https://github.com/holic)! - Fixed block formatting in `watchBlocks` for WebSocket subscriptions.

- [`1f3f2834`](https://github.com/wevm/viem/commit/1f3f2834a443165a71b27d2d0d46fa13532ccdd1) Thanks [@jxom](https://github.com/jxom)! - Added `typeHex` to `Transaction` type.

## 1.0.7

### Patch Changes

- [#707](https://github.com/wevm/viem/pull/707) [`3fc045d1`](https://github.com/wevm/viem/commit/3fc045d152a11edb698bd86aecb38909f6a3f811) Thanks [@tmm](https://github.com/tmm)! - Made TypeScript requirement explicit (was missing previously).

## 1.0.6

### Patch Changes

- [`90fd40ba`](https://github.com/wevm/viem/commit/90fd40ba0d5b7e248c7494ca5cbfa46eac281753) Thanks [@jxom](https://github.com/jxom)! - Fixed potential nullish `chainId` conflict in `sendTransaction` (for Local Accounts).

## 1.0.5

### Patch Changes

- [#699](https://github.com/wevm/viem/pull/699) [`79d1b4af`](https://github.com/wevm/viem/commit/79d1b4af5037eee4b408af9d0e3cf5e228d2601d) Thanks [@jxom](https://github.com/jxom)! - Support custom transaction formatters on `sendUnsignedTransaction`.

## 1.0.4

### Patch Changes

- [`8407fdcc`](https://github.com/wevm/viem/commit/8407fdcc16e97a5346a07382c25cb1681a50d5e8) Thanks [@jxom](https://github.com/jxom)! - Fixed fraction length overflow edge-case.

## 1.0.3

### Patch Changes

- [#687](https://github.com/wevm/viem/pull/687) [`a274ab33`](https://github.com/wevm/viem/commit/a274ab335688ce84d7fa8ca72427de7fe9937b13) Thanks [@jeetiss](https://github.com/jeetiss)! - Added `/*#__PURE__*/` annotatations for better tree-shaking

- [#672](https://github.com/wevm/viem/pull/672) [`e033f467`](https://github.com/wevm/viem/commit/e033f467082bcfa6f42c490ede1d7df50f497456) Thanks [@sambacha](https://github.com/sambacha)! - Turned off `esModuleInterop` & `allowSyntheticDefaultImports` in tsconfig.

- [#683](https://github.com/wevm/viem/pull/683) [`fe259a0e`](https://github.com/wevm/viem/commit/fe259a0ed6e4f7e264a7c5c761fea3a8ca68efc9) Thanks [@jeetiss](https://github.com/jeetiss)! - Marked package as side effects free

## 1.0.2

### Patch Changes

- [#677](https://github.com/wevm/viem/pull/677) [`a0a2ebb`](https://github.com/wevm/viem/commit/a0a2ebb6b53354be1c1492eed3bfd1b218ac71e4) Thanks [@hexcowboy](https://github.com/hexcowboy)! - Added ability to pass an `AbiFunction` to `getFunctionSelector`, and `AbiEvent` to `getEventSelector`.

## 1.0.1

### Patch Changes

- [#675](https://github.com/wevm/viem/pull/675) [`61429677`](https://github.com/wevm/viem/commit/61429677b28ad5ce8240a4278ef0f0cc1587b57a) Thanks [@tmm](https://github.com/tmm)! - Fixed payable `value` type inference.

## 1.0.0

### [Migration Guide](https://viem.sh/docs/migration-guide)

### Major Changes

- [#576](https://github.com/wevm/viem/pull/576) [`7d42767`](https://github.com/wevm/viem/commit/7d4276775a6d42cfab850498e522fe31134f0880) Thanks [@jxom](https://github.com/jxom)! - Released v1.

- [#576](https://github.com/wevm/viem/pull/576) [`7d42767`](https://github.com/wevm/viem/commit/7d4276775a6d42cfab850498e522fe31134f0880) Thanks [@jxom](https://github.com/jxom)! - **Breaking (edge case):** `decodeEventLog` no longer attempts to partially decode events. If the log does not conform to the ABI (mismatch between the number of indexed/non-indexed arguments to topics/data), it will throw an error.

- [#576](https://github.com/wevm/viem/pull/576) [`7d42767`](https://github.com/wevm/viem/commit/7d4276775a6d42cfab850498e522fe31134f0880) Thanks [@jxom](https://github.com/jxom)! - **Breaking:** `logIndex` & `transactionIndex` on `Log` now return a `number` instead of a `bigint`

- [#576](https://github.com/wevm/viem/pull/576) [`7d42767`](https://github.com/wevm/viem/commit/7d4276775a6d42cfab850498e522fe31134f0880) Thanks [@jxom](https://github.com/jxom)! - **Breaking:** Removed `ethersWalletToAccount` adapter.

  This adapter was introduced when viem did not have Private Key & HD Accounts. Since 0.2, viem provides all the utilities needed to create and import [Private Key](https://viem.sh/docs/accounts/local/privateKeyToAccount) & [HD Accounts](https://viem.sh/docs/accounts/local/mnemonicToAccount).

  If you still need it, you can copy + paste the [old implementation](https://github.com/wevm/viem/blob/a9a71507032db896295fa1f3fa2dd6c2bdc85137/src/adapters/ethers.ts).

### Patch Changes

- [#576](https://github.com/wevm/viem/pull/576) [`7d42767`](https://github.com/wevm/viem/commit/7d4276775a6d42cfab850498e522fe31134f0880) Thanks [@jxom](https://github.com/jxom)! - Added Batch JSON-RPC on `http` Transport.

- [#657](https://github.com/wevm/viem/pull/657) [`af48368`](https://github.com/wevm/viem/commit/af48368f07856e50cb7afa8cac077e3a0ecc05fb) Thanks [@izayl](https://github.com/izayl)! - Fixed `getAbiItem` from returning mismatched type when overload with different lengths.

- [#576](https://github.com/wevm/viem/pull/576) [`7d42767`](https://github.com/wevm/viem/commit/7d4276775a6d42cfab850498e522fe31134f0880) Thanks [@jxom](https://github.com/jxom)! - Upgraded ENS Universal Resolver contract address.

- [#576](https://github.com/wevm/viem/pull/576) [`7d42767`](https://github.com/wevm/viem/commit/7d4276775a6d42cfab850498e522fe31134f0880) Thanks [@jxom](https://github.com/jxom)! - Added support for labels larger than 255 bytes when resolving ENS names.

- [#576](https://github.com/wevm/viem/pull/576) [`7d42767`](https://github.com/wevm/viem/commit/7d4276775a6d42cfab850498e522fe31134f0880) Thanks [@jxom](https://github.com/jxom)! - Added a `strict` parameter to `getLogs`, `createEventFilter` & `createContractEventFilter`.

  When `strict` mode is turned **on**, only logs that conform to the indexed/non-indexed arguments on the event definition/ABI (`event`) will be returned.
  When `strict` mode is turned **off (default)**, logs that do not conform to the indexed/non-indexed arguments on the event definition/ABI (`event`) will be included, but the `args` property will be `undefined` (as we cannot decode these events).

- [#576](https://github.com/wevm/viem/pull/576) [`7d42767`](https://github.com/wevm/viem/commit/7d4276775a6d42cfab850498e522fe31134f0880) Thanks [@jxom](https://github.com/jxom)! - Refactored EIP1193 request fn types.

## 0.3.50

### Patch Changes

- [`7dc25b5`](https://github.com/wevm/viem/commit/7dc25b56ae5f8c69255f6ebc404fb49c33cb13b7) Thanks [@jxom](https://github.com/jxom)! - Improved Ganache test actions.

## 0.3.49

### Patch Changes

- [`0b92f3a`](https://github.com/wevm/viem/commit/0b92f3ad535a27e1b8ba70fc3f6e1087ed2cd05f) Thanks [@jxom](https://github.com/jxom)! - Added more chains from @wagmi/chains.

## 0.3.47

### Patch Changes

- [`cc256c0`](https://github.com/wevm/viem/commit/cc256c0a0dd5cb99975c5a497e5eb025990deaff) Thanks [@jxom](https://github.com/jxom)! - Fixed unit conversion.

## 0.3.46

### Patch Changes

- [`770c3d1e`](https://github.com/wevm/viem/commit/770c3d1e1954b94dea6a58e7180b8600e910ad4e) Thanks [@jxom](https://github.com/jxom)! - Bumped `@wagmi/chains`.

## 0.3.45

### Patch Changes

- [#637](https://github.com/wevm/viem/pull/637) [`bbd8f07`](https://github.com/wevm/viem/commit/bbd8f072f92f189c0b55d5e3cf8c9e4f38b1c6bc) Thanks [@jxom](https://github.com/jxom)! - Updated `abitype` to 0.8.7.

## 0.3.44

### Patch Changes

- [#610](https://github.com/wevm/viem/pull/610) [`06ee89c5`](https://github.com/wevm/viem/commit/06ee89c53a5f0226407b915cdf9da5550ed58010) Thanks [@jxom](https://github.com/jxom)! - Added ability to hash data representation of `message` via a `raw` attribute in `signMessage`, `verifyMessage`, `recoverMessageAddress`.

  ```ts
  await walletClient.signMessage({
    message: { raw: "0x68656c6c6f20776f726c64" },
  });
  ```

## 0.3.43

### Patch Changes

- [#632](https://github.com/wevm/viem/pull/632) [`2538548`](https://github.com/wevm/viem/commit/2538548a5c6a897a8a2c5a0e5ea6398c86b54c59) Thanks [@tmm](https://github.com/tmm)! - Exported missing portable type.

- [#630](https://github.com/wevm/viem/pull/630) [`a446a50`](https://github.com/wevm/viem/commit/a446a50ad8fe0b6c4a20df82e37a0492995840a4) Thanks [@tmm](https://github.com/tmm)! - Narrowed contract instance address.

## 0.3.42

### Patch Changes

- [#619](https://github.com/wevm/viem/pull/619) [`73c7f498`](https://github.com/wevm/viem/commit/73c7f4980ebc755068b8cf9df70390d1e2ab2524) Thanks [@sakulstra](https://github.com/sakulstra)! - Added `address` and `abi` properties to Contract Instances.

## 0.3.41

### Patch Changes

- [`1b3f584`](https://github.com/wevm/viem/commit/1b3f5847a44ba051f19d42dfb03962a4c6a4e36b) Thanks [@jxom](https://github.com/jxom)! - Fixed `chainId` type on Transaction types.

## 0.3.40

### Patch Changes

- [#608](https://github.com/wevm/viem/pull/608) [`6e9313b`](https://github.com/wevm/viem/commit/6e9313b8ed13f930666a06991ed0cd61ab286de0) Thanks [@tmm](https://github.com/tmm)! - Exported types

## 0.3.39

### Patch Changes

- [#603](https://github.com/wevm/viem/pull/603) [`ee2b2b8`](https://github.com/wevm/viem/commit/ee2b2b8c2eba540cc73ef78e29870f3314a008c3) Thanks [@ilamanov](https://github.com/ilamanov)! - Fixed `getFunctionSelector` for functions with no arguments.

## 0.3.38

### Patch Changes

- [#598](https://github.com/wevm/viem/pull/598) [`baea299`](https://github.com/wevm/viem/commit/baea2991ce405015e4f68c2fde90a154b698e7a4) Thanks [@iuriiiurevich](https://github.com/iuriiiurevich)! - Fixed an issue in `withCache` where the promise cache would not clear upon rejection.

## 0.3.37

### Patch Changes

- [#572](https://github.com/wevm/viem/pull/572) [`3e5bcbf`](https://github.com/wevm/viem/commit/3e5bcbf1233ea3cc8674767c10bd8dccdfd99182) Thanks [@tmm](https://github.com/tmm)! - Fixed contract instance `estimateGas` typing.

## 0.3.36

### Patch Changes

- [#554](https://github.com/wevm/viem/pull/554) [`d5297c6`](https://github.com/wevm/viem/commit/d5297c6e32fc148a63c34fe47cd590cfc9c665ec) Thanks [@tmm](https://github.com/tmm)! - Fixed portable types

- [#556](https://github.com/wevm/viem/pull/556) [`81a3aed`](https://github.com/wevm/viem/commit/81a3aed513167588f0c3433af8407cc23c78f61f) Thanks [@tmm](https://github.com/tmm)! - Fallback to `client.account` for `estimateGas`.

- [#560](https://github.com/wevm/viem/pull/560) [`a5dd3c6`](https://github.com/wevm/viem/commit/a5dd3c6dcdb2c7625aacd9c9bc498bd86530dd77) Thanks [@Volchunovich](https://github.com/Volchunovich)! - Fixed docs links

## 0.3.35

### Patch Changes

- [`1cc1dc2`](https://github.com/wevm/viem/commit/1cc1dc2e989765ea0d0afd72375505b93e0013a5) Thanks [@jxom](https://github.com/jxom)! - Fixed `account` parameter type on `readContract`.

## 0.3.34

### Patch Changes

- [`5c75ee5`](https://github.com/wevm/viem/commit/5c75ee598a0bd09709f619464e48cbb5fa2327d8) Thanks [@jxom](https://github.com/jxom)! - Added `EstimateContractGasParameters` & `EstimateContractGasReturnType` types.

## 0.3.33

### Patch Changes

- [`0cb8f31`](https://github.com/wevm/viem/commit/0cb8f31589d65d056de66c13637635785d97b730) Thanks [@jxom](https://github.com/jxom)! - Fixed an issue where `watchContractEvent` would throw a serialize error for bigint args.

## 0.3.32

### Patch Changes

- [`fb5b321`](https://github.com/wevm/viem/commit/fb5b321a9238d68a59f387632dd89ccb626a8cb5) Thanks [@jxom](https://github.com/jxom)! - Allowed recovery id as v when recovering public key.

- [`9df44ce`](https://github.com/wevm/viem/commit/9df44cea3843a74f9e04591d3c683db1982269fb) Thanks [@jxom](https://github.com/jxom)! - Added `ganache` as another mode for Test Client

## 0.3.31

### Patch Changes

- [#540](https://github.com/wevm/viem/pull/540) [`0d8f154`](https://github.com/wevm/viem/commit/0d8f154fbcbf68f8f8b1b8bde0cf5661ffc44370) Thanks [@jxom](https://github.com/jxom)! - Added proxy packages to support bundlers that are not compatible with `package.json#exports`.

## 0.3.30

### Patch Changes

- [`228d949`](https://github.com/wevm/viem/commit/228d949bce648065ecef629173d1b847e2fc8f21) Thanks [@jxom](https://github.com/jxom)! - Bumped `waitForTransactionReceipt` retry count.

## 0.3.29

### Patch Changes

- [#527](https://github.com/wevm/viem/pull/527) [`840d3d7`](https://github.com/wevm/viem/commit/840d3d7411a33ad02c71bd180b53244df91cd779) Thanks [@jxom](https://github.com/jxom)! - Fixed `trim` to trim trailing zero byte data instead of all trailing zeros.

## 0.3.28

### Patch Changes

- [`ffee4f8`](https://github.com/wevm/viem/commit/ffee4f86928ada54d2c6a4403aafa7b861eeccb2) Thanks [@jxom](https://github.com/jxom)! - Bumped `waitForTransactionReceipt` exponential backoff scalar

## 0.3.27

### Patch Changes

- [#519](https://github.com/wevm/viem/pull/519) [`2ab7b56`](https://github.com/wevm/viem/commit/2ab7b56ea6828f92e10f287bac68f1f70815da1a) Thanks [@jxom](https://github.com/jxom)! - Batched websocket initialization.

- [#518](https://github.com/wevm/viem/pull/518) [`65a0896`](https://github.com/wevm/viem/commit/65a0896426a28e2d11438984a6ed6b604d87c316) Thanks [@jxom](https://github.com/jxom)! - Added `strict` option to `isHex` & optimized data utilities.

- [#515](https://github.com/wevm/viem/pull/515) [`c1b81dc`](https://github.com/wevm/viem/commit/c1b81dc36ad787b632099a98ba2b4bd5e03ddafa) Thanks [@jxom](https://github.com/jxom)! - Optimized `getTransaction` strategy in `waitForTransactionReceipt`.

## 0.3.26

### Patch Changes

- [#500](https://github.com/wevm/viem/pull/500) [`1da5831`](https://github.com/wevm/viem/commit/1da583137a32f381a2e2e5f260105ce8542bbaee) Thanks [@jxom](https://github.com/jxom)! - refactor: lax log types

## 0.3.25

### Patch Changes

- [#506](https://github.com/wevm/viem/pull/506) [`f396e5d`](https://github.com/wevm/viem/commit/f396e5d242bbf68a4b34596db6943d52fee19e79) Thanks [@jxom](https://github.com/jxom)! - Support suffixed data in `decodeAbiParameters`.

## 0.3.24

### Patch Changes

- [`9852bcd`](https://github.com/wevm/viem/commit/9852bcdfb83bfdda43fb276b3a1266b30592d56e) Thanks [@jxom](https://github.com/jxom)! - Fixed custom solidity errors with no args.

## 0.3.23

### Patch Changes

- [#489](https://github.com/wevm/viem/pull/489) [`d130c72`](https://github.com/wevm/viem/commit/d130c7277bbb175b7ce82fe2c32ad9f65b3ae63f) Thanks [@tmm](https://github.com/tmm)! - Improved RpcError code types.

- [`670d825`](https://github.com/wevm/viem/commit/670d825aa8105a6fc5e4fedc540d055d28ec91e1) Thanks [@jxom](https://github.com/jxom)! - Fixed \`call\` revert data for node clients that have nested error data.

- [#487](https://github.com/wevm/viem/pull/487) [`566e77d`](https://github.com/wevm/viem/commit/566e77dfafcd5b5486260e492d8db890b788b264) Thanks [@kdembler](https://github.com/kdembler)! - fix encodeEventTopics for leading non-indexed args

## 0.3.22

### Patch Changes

- [`9ae5eaa`](https://github.com/wevm/viem/commit/9ae5eaa1465240d07577d380e7387f1a065707e3) Thanks [@jxom](https://github.com/jxom)! - Fixed `functionName` type inference in `SimulateContractReturnType`.

## 0.3.21

### Patch Changes

- [#475](https://github.com/wevm/viem/pull/475) [`64a2f51`](https://github.com/wevm/viem/commit/64a2f51799431faf28946127a3d62373051d8553) Thanks [@jxom](https://github.com/jxom)! - Fixed \`hashMessage\` string conversion for messages that have same format as hex bytes.

- [#474](https://github.com/wevm/viem/pull/474) [`1886095`](https://github.com/wevm/viem/commit/18860951b7276c5b67632113f96a09cda3a48d25) Thanks [@jxom](https://github.com/jxom)! - Exported `assertCurrentChain` util.

## 0.3.20

### Patch Changes

- [#470](https://github.com/wevm/viem/pull/470) [`be9501e`](https://github.com/wevm/viem/commit/be9501eb3b509a0fe09dd087ee46d11642a9c408) Thanks [@jxom](https://github.com/jxom)! - Fixed issue where `waitForTransactionReceipt` would throw immediately for RPC Providers which may be slow to sync mined transactions.

## 0.3.19

### Patch Changes

- [#320](https://github.com/wevm/viem/pull/320) [`6d6d092`](https://github.com/wevm/viem/commit/6d6d092c6cacb229bb2696261ae9dbe742c26647) Thanks [@janek26](https://github.com/janek26)! - Added support for Contract Wallet signature verification (EIP-6492) via `publicClient.verifyMessage` & `publicClient.verifyTypedData`.

## 0.3.18

### Patch Changes

- [#445](https://github.com/wevm/viem/pull/445) [`9e096a9`](https://github.com/wevm/viem/commit/9e096a92e2722e0dd0acd5ab79d5907e7d9bc82f) Thanks [@jxom](https://github.com/jxom)! - Refactored contract decoding utility types.

- [#448](https://github.com/wevm/viem/pull/448) [`29cf036`](https://github.com/wevm/viem/commit/29cf0363f0bfe89f0d63a281272151c6bba47ce1) Thanks [@jxom](https://github.com/jxom)! - Refactored inferred types on `Log` (eventName, args, topics), `getLogs`, `getFilterLogs` & `getFilterChanges`.

- [#435](https://github.com/wevm/viem/pull/435) [`711cf94`](https://github.com/wevm/viem/commit/711cf9460a262fb12c520d7860f22915fb4c58f6) Thanks [@Raiden1411](https://github.com/Raiden1411)! - Updated `abitype` to `0.8.2` and exported abitype errors.

- [#445](https://github.com/wevm/viem/pull/445) [`9e096a9`](https://github.com/wevm/viem/commit/9e096a92e2722e0dd0acd5ab79d5907e7d9bc82f) Thanks [@jxom](https://github.com/jxom)! - Made "name" parameter (`eventName`, `functionName`, etc) optional on contract encoding/decoding utilities when only one ABI item is provided.

## 0.3.17

### Patch Changes

- [#443](https://github.com/wevm/viem/pull/443) [`ca0cb85`](https://github.com/wevm/viem/commit/ca0cb852999dd90aebdb938d8bf4dbbec504a173) Thanks [@jxom](https://github.com/jxom)! - Fixed eth_call & eth_estimateGas calls for nodes that conform to the older JSON-RPC spec.

## 0.3.16

### Patch Changes

- [`482aaa1`](https://github.com/wevm/viem/commit/482aaa1651ff06575860c6d9d38bcde05e5b136e) Thanks [@jxom](https://github.com/jxom)! - Wrapped slice offset out-of-bounds error in a `BaseError`.

## 0.3.15

### Patch Changes

- [#436](https://github.com/wevm/viem/pull/436) [`72ed656`](https://github.com/wevm/viem/commit/72ed6567897ee87939d33e89a7d6599ec8db321e) Thanks [@jxom](https://github.com/jxom)! - Fixed an issue where `multicall`'s return type was incorrectly flattening when `allowFailure: false`.

## 0.3.14

### Patch Changes

- [#426](https://github.com/wevm/viem/pull/426) [`840d19d`](https://github.com/wevm/viem/commit/840d19d652819001addfe9c47267d9e7c71841bd) Thanks [@izayl](https://github.com/izayl)! - Added constants zeroAddress.

- [#424](https://github.com/wevm/viem/pull/424) [`2eb73f6`](https://github.com/wevm/viem/commit/2eb73f6f449be7f00790c992202816d5eccf5232) Thanks [@fubhy](https://github.com/fubhy)! - Removed the `defineChain` export from `viem/chains`.

- [#427](https://github.com/wevm/viem/pull/427) [`41bc9e3`](https://github.com/wevm/viem/commit/41bc9e38dcbd71d10ea28edaaad48fb81d40f61b) Thanks [@jxom](https://github.com/jxom)! - Added support for EIP-3668 CCIP Read.

- [#431](https://github.com/wevm/viem/pull/431) [`31aafb3`](https://github.com/wevm/viem/commit/31aafb3514adff65bc4c27b78dad90057ee97421) Thanks [@jxom](https://github.com/jxom)! - Added a `dataSuffix` argument to `writeContract` and `simulateContract`

## 0.3.13

### Patch Changes

- [`eb32e6c`](https://github.com/wevm/viem/commit/eb32e6c8a412aa4d16339236d4a14d820a26fdc1) Thanks [@fubhy](https://github.com/fubhy)! - Fixed `mine()` to resolve to `undefined` instead of `null`.

## 0.3.12

### Patch Changes

- [`6f8151c`](https://github.com/wevm/viem/commit/6f8151c58fcb5e14b7a954df6e941fe3cca4054c) Thanks [@jxom](https://github.com/jxom)! - Flagged 403 as non-deterministic error for `fallback` Transport.

## 0.3.11

### Patch Changes

- [#404](https://github.com/wevm/viem/pull/404) [`2c380cf`](https://github.com/wevm/viem/commit/2c380cf0f0e528d6ff9e9c354e4fcec28df5329b) Thanks [@izayl](https://github.com/izayl)! - Added support for EIP-1191 address checksum.

- [#398](https://github.com/wevm/viem/pull/398) [`cbb4f1f`](https://github.com/wevm/viem/commit/cbb4f1f66b80914313e54bf7022e59a1b0bee2d3) Thanks [@jxom](https://github.com/jxom)! - Added a new `batchSize` parameter to `multicall` which limits the size of each calldata chunk.

## 0.3.10

### Patch Changes

- [`777fa34`](https://github.com/wevm/viem/commit/777fa34c9ce5630696e554127e39e5e9386ad74e) Thanks [@jxom](https://github.com/jxom)! - Fixed wallet_watchAsset type.

## 0.3.9

### Patch Changes

- [`b4d6623`](https://github.com/wevm/viem/commit/b4d662360f55d5963e015f7080538a167e89b1f6) Thanks [@jxom](https://github.com/jxom)! - Fixed multicall return type.

## 0.3.8

### Patch Changes

- [`8371ad9`](https://github.com/wevm/viem/commit/8371ad9cb6987b5876a679ba502a80573c92ec64) Thanks [@jxom](https://github.com/jxom)! - Fixed WebSocket import on Vite environments.

## 0.3.7

### Patch Changes

- [#399](https://github.com/wevm/viem/pull/399) [`eefd839`](https://github.com/wevm/viem/commit/eefd83997a98113b81d5ba21a8b5492a1de2284c) Thanks [@jxom](https://github.com/jxom)! - Fixed async imports in Vite environments.

- [#397](https://github.com/wevm/viem/pull/397) [`69b95ed`](https://github.com/wevm/viem/commit/69b95ed5991c712d11ff4de1bb873c9a2af152b3) Thanks [@tmm](https://github.com/tmm)! - Made `value` required for payable functions.

## 0.3.6

### Patch Changes

- [`ae6d388`](https://github.com/wevm/viem/commit/ae6d3883ec41dfdd3750a5f7473495d011df5802) Thanks [@jxom](https://github.com/jxom)! - Fixed unpublished type declarations.

## 0.3.5

### Patch Changes

- [`0d38807`](https://github.com/wevm/viem/commit/0d38807bcd61fae5c5d4736aed6c59277c9b4bf4) Thanks [@jxom](https://github.com/jxom)! - Fixed `batch` config in `createPublicClient`.

## 0.3.4

### Patch Changes

- [#387](https://github.com/wevm/viem/pull/387) [`230fcfd`](https://github.com/wevm/viem/commit/230fcfd97bb4937502e604630bb97695198e7b7e) Thanks [@jxom](https://github.com/jxom)! - Added support for `eth_call` batch aggregation via multicall `aggregate3`.

- [#388](https://github.com/wevm/viem/pull/388) [`bc254d8`](https://github.com/wevm/viem/commit/bc254d882bed6216daa72d5820526e6573a34e85) Thanks [@jxom](https://github.com/jxom)! - Added `size` as an argument to hex/bytes encoding/decoding utilities.

- [`03816ec`](https://github.com/wevm/viem/commit/03816ec421eb8adbcb17bd44c5dc344407acba2d) Thanks [@jxom](https://github.com/jxom)! - Disabled `fallback` transport ranking by default.

## 0.3.3

### Patch Changes

- [#383](https://github.com/wevm/viem/pull/383) [`7e9731c`](https://github.com/wevm/viem/commit/7e9731cf315ddcd10f35c81c63a15af6aa78350d) Thanks [@Raiden1411](https://github.com/Raiden1411)! - Fixed an issue where `serializeTransaction` was incorrectly encoding zero-ish properties.

## 0.3.2

### Patch Changes

- [#375](https://github.com/wevm/viem/pull/375) [`f9bedc9`](https://github.com/wevm/viem/commit/f9bedc94ecd41fdcb2f0fed1d90162567c2a31ea) Thanks [@fubhy](https://github.com/fubhy)! - Support edge runtime

## 0.3.1

### Patch Changes

- [`6856443`](https://github.com/wevm/viem/commit/6856443fb75421639c9622343d5958791028874c) Thanks [@jxom](https://github.com/jxom)! - Added `recoverPublicKey`.

- [#363](https://github.com/wevm/viem/pull/363) [`ee1cb7f`](https://github.com/wevm/viem/commit/ee1cb7ff546236041b1ca115bb2a252520e8ef7f) Thanks [@tmm](https://github.com/tmm)! - Added inference to `getLogs` `event` type.

- [#365](https://github.com/wevm/viem/pull/365) [`f4dcc33`](https://github.com/wevm/viem/commit/f4dcc33739a339c286f852a377f71fbf2fb7ab97) Thanks [@fubhy](https://github.com/fubhy)! - Fixed `getAbiItem` to not use a generic type variable for the return type

## 0.3.0

### Minor Changes

- [#355](https://github.com/wevm/viem/pull/355) [`b1acfc9`](https://github.com/wevm/viem/commit/b1acfc9198bfbed8c3de6e769c5ff06d7124881c) Thanks [@jxom](https://github.com/jxom)! - **Breaking:** Renamed `RequestError` to `RpcError`.
  **Breaking:** Removed `RpcRequestError` – use `RpcError` instead.
  **Breaking:** Renamed `RpcError` to `RpcRequestError`.

### Patch Changes

- [#355](https://github.com/wevm/viem/pull/355) [`b1acfc9`](https://github.com/wevm/viem/commit/b1acfc9198bfbed8c3de6e769c5ff06d7124881c) Thanks [@jxom](https://github.com/jxom)! - Added `ProviderRpcError` subclass.

  Added EIP-1193 `UnauthorizedProviderError`, `UnsupportedProviderMethodError`, `ProviderDisconnectedError`, and `ChainDisconnectedError`.

- [#349](https://github.com/wevm/viem/pull/349) [`b275811`](https://github.com/wevm/viem/commit/b2758116623567a07e9c2cae7e2471e3c6bf2ecf) Thanks [@jxom](https://github.com/jxom)! - Fixed an issue where Filter querying (`eth_getFilterChanges`, etc) was not being scoped to the Transport that created the Filter.

## 0.2.14

### Patch Changes

- [#344](https://github.com/wevm/viem/pull/344) [`bb9c2a4`](https://github.com/wevm/viem/commit/bb9c2a4b769655f230b8af22efb871393e78a80d) Thanks [@jxom](https://github.com/jxom)! - Added `EIP1193Provider` type.

## 0.2.13

### Patch Changes

- [#331](https://github.com/wevm/viem/pull/331) [`cd7b642`](https://github.com/wevm/viem/commit/cd7b64242643247c3c04896dacdd95b2a335ba52) Thanks [@jxom](https://github.com/jxom)! - Migrated to TypeScript 5.
  Migrated build process from `tsup` to `tsc`.

- [#343](https://github.com/wevm/viem/pull/343) [`579171d`](https://github.com/wevm/viem/commit/579171dbc691f9c352688455f21b6c4187dbf422) Thanks [@fubhy](https://github.com/fubhy)! - Fixed conditional types for poll options on `watchBlocks` & `watchPendingTransactions`.

## 0.2.12

### Patch Changes

- [#328](https://github.com/wevm/viem/pull/328) [`ee87fe7`](https://github.com/wevm/viem/commit/ee87fe73884297db1c3957453efd7c326924c269) Thanks [@jxom](https://github.com/jxom)! - Tweaked error inheritence for `UserRejectedRequestError` & `SwitchChainError` to be more friendly with custom errors.

## 0.2.11

### Patch Changes

- [#326](https://github.com/wevm/viem/pull/326) [`c83616a`](https://github.com/wevm/viem/commit/c83616ad33aa06054342a3bf72bcb51c09ee0ada) Thanks [@jxom](https://github.com/jxom)! - Fixed an issue where filtered logs that do not conform to the provided ABI would cause `getLogs`, `getFilterLogs` or `getFilterChanges` to throw – these logs are now skipped. See [#323](https://github.com/wevm/viem/issues/323#issuecomment-1499654052) for more info.

## 0.2.10

### Patch Changes

- [#322](https://github.com/wevm/viem/pull/322) [`ea019d7`](https://github.com/wevm/viem/commit/ea019d75c5243d8ae2b8ca1686b34026b170d903) Thanks [@tmm](https://github.com/tmm)! - Fixed properties passed to ethers adapter `signTransaction`

## 0.2.9

### Patch Changes

- [#317](https://github.com/wevm/viem/pull/317) [`2720ba5`](https://github.com/wevm/viem/commit/2720ba566d02fdb2c6ddc8d016ec252606a9cb95) Thanks [@jxom](https://github.com/jxom)! - Fixed `transports` property type on `FallbackTransport`.

## 0.2.8

### Patch Changes

- [#313](https://github.com/wevm/viem/pull/313) [`eb2280c`](https://github.com/wevm/viem/commit/eb2280cbc65b3e509b4b3871fe75b236101da442) Thanks [@jxom](https://github.com/jxom)! - Migrated from `idna-uts46-hx` to `@adraffy/ens-normalize` for `normalize`.

## 0.2.7

### Patch Changes

- [#310](https://github.com/wevm/viem/pull/310) [`6dfc225`](https://github.com/wevm/viem/commit/6dfc22537b9dd5740911b8677bba01cc477b9b23) Thanks [@jxom](https://github.com/jxom)! - Made `GetValue` return `{ value?: never }` instead of `unknown` for contract functions that are not payable.

## 0.2.6

### Patch Changes

- [#295](https://github.com/wevm/viem/pull/295) [`9a15a61`](https://github.com/wevm/viem/commit/9a15a612dd4a416f932c99519416665c0ffac214) Thanks [@fubhy](https://github.com/fubhy)! - Return discrimated union type from `decodeFunctionData`

- [#304](https://github.com/wevm/viem/pull/304) [`8e1b712`](https://github.com/wevm/viem/commit/8e1b712efc256c16a98408d10557d5f55d8927d7) Thanks [@fubhy](https://github.com/fubhy)! - Fixed `getTransactionType` to honor `undefined` EIP-1559, EIP-2930 or Legacy attributes.

- [#302](https://github.com/wevm/viem/pull/302) [`c00a459`](https://github.com/wevm/viem/commit/c00a459490ff283812e6847547149a8104a5c4d0) Thanks [@fubhy](https://github.com/fubhy)! - Fixed forwarding of options to transport for wallet client

## 0.2.5

### Patch Changes

- [#297](https://github.com/wevm/viem/pull/297) [`96d072c`](https://github.com/wevm/viem/commit/96d072cac1ae09f85afcbbca63c99f10a80f1722) Thanks [@fubhy](https://github.com/fubhy)! - Fixed wordlists exports.

## 0.2.4

### Patch Changes

- [#293](https://github.com/wevm/viem/pull/293) [`859352c`](https://github.com/wevm/viem/commit/859352c38333ec22924b24242db8f583fc73d9fb) Thanks [@TateB](https://github.com/TateB)! - Fixed ENS address resolution for when resolver returns with a null address, or resolvers that do not support `addr`. `getEnsAddress` returns `null` for these cases.

## 0.2.3

### Patch Changes

- [#290](https://github.com/wevm/viem/pull/290) [`ef2bbaf`](https://github.com/wevm/viem/commit/ef2bbafa2b372bfa8fa1b29ffabea75ca3ea1122) Thanks [@holic](https://github.com/holic)! - Fixed ENS address resolution for "0x"-prefixed names.

## 0.2.2

### Patch Changes

- [#289](https://github.com/wevm/viem/pull/289) [`8c51f93`](https://github.com/wevm/viem/commit/8c51f93cfbe304c88b018c679c4413e8874692e7) Thanks [@jxom](https://github.com/jxom)! - Pinned dependencies.

- [#289](https://github.com/wevm/viem/pull/289) [`8c51f93`](https://github.com/wevm/viem/commit/8c51f93cfbe304c88b018c679c4413e8874692e7) Thanks [@jxom](https://github.com/jxom)! - Made `@scure/bip39/wordlists/*` & `idna-uts46-hx` exports ESM friendly.

## 0.2.1

### Patch Changes

- [#285](https://github.com/wevm/viem/pull/285) [`ab9fd12`](https://github.com/wevm/viem/commit/ab9fd121fbe271ba9bee43aea2d7bba122dc4f03) Thanks [@tmm](https://github.com/tmm)! - Exported `hdKeyToAccount` and `mnemonicToAccount`.

## 0.2.0 – [Migration Guide](https://viem.sh/docs/migration-guide)

### Minor Changes

- [#229](https://github.com/wevm/viem/pull/229) [`098f342`](https://github.com/wevm/viem/commit/098f3423ee84f9deb09c2c7d30e950a046c07ea9) Thanks [@jxom](https://github.com/jxom)! - **Breaking:** Removed the `getAccount` function.

  **For JSON-RPC Accounts, use the address itself.**

  ```diff
  import { createWalletClient, custom } from 'viem'
  import { mainnet } from 'viem/chains'

  const address = '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2'

  const client = createWalletClient({
  - account: getAccount(address),
  + account: address,
    chain: mainnet,
    transport: custom(window.ethereum)
  })
  ```

  **For Ethers Wallet Adapter, use `ethersWalletToAccount`.**

  If you were using the Ethers Wallet adapter, you can use the `ethersWalletToAccount` function.

  > Note: viem 0.2.0 now has a [Private Key](/docs/accounts/local/privateKeyToAccount) & [Mnemonic Account](/docs/accounts/local/mnemonicToAccount) implementation. You probably do not need this adapter anymore. This adapter may be removed in a future version.

  ```diff
  import { createWalletClient, custom } from 'viem'
  import { mainnet } from 'viem/chains'
  - import { getAccount } from 'viem/ethers'
  + import { ethersWalletToAccount } from 'viem/ethers'
  import { Wallet } from 'ethers'

  - const account = getAccount(new Wallet('0x...'))
  + const account = ethersWalletToAccount(new Wallet('0x...'))

  const client = createWalletClient({
    account,
    chain: mainnet,
    transport: custom(window.ethereum)
  })
  ```

  **For Local Accounts, use `toAccount`.**

  ```diff
  - import { createWalletClient, http, getAccount } from 'viem'
  + import { createWalletClient, http } from 'viem'
  + import { toAccount } from 'viem/accounts'
  import { mainnet } from 'viem/chains'
  import { getAddress, signMessage, signTransaction } from './sign-utils'

  const privateKey = '0x...'
  - const account = getAccount({
  + const account = toAccount({
    address: getAddress(privateKey),
    signMessage(message) {
      return signMessage(message, privateKey)
    },
    signTransaction(transaction) {
      return signTransaction(transaction, privateKey)
    },
    signTypedData(typedData) {
      return signTypedData(typedData, privateKey)
    }
  })

  const client = createWalletClient({
    account,
    chain: mainnet,
    transport: http()
  })
  ```

- [#229](https://github.com/wevm/viem/pull/229) [`098f342`](https://github.com/wevm/viem/commit/098f3423ee84f9deb09c2c7d30e950a046c07ea9) Thanks [@jxom](https://github.com/jxom)! - **Breaking:** Removed `assertChain` argument on `sendTransaction`, `writeContract` & `deployContract`. If you wish to bypass the chain check (not recommended unless for testing purposes), you can pass `chain: null`.

  ```diff
  await walletClient.sendTransaction({
  - assertChain: false,
  + chain: null,
    ...
  })
  ```

- [#229](https://github.com/wevm/viem/pull/229) [`098f342`](https://github.com/wevm/viem/commit/098f3423ee84f9deb09c2c7d30e950a046c07ea9) Thanks [@jxom](https://github.com/jxom)! - **Breaking:** A chain is now required for the `sendTransaction`, `writeContract`, `deployContract` Actions.

  You can hoist the Chain on the Client:

  ```diff
  import { createWalletClient, custom, getAccount } from 'viem'
  import { mainnet } from 'viem/chains'

  export const walletClient = createWalletClient({
  + chain: mainnet,
    transport: custom(window.ethereum)
  })

  const account = getAccount('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266')

  const hash = await walletClient.sendTransaction({
    account,
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: 1000000000000000000n
  })
  ```

  Alternatively, you can pass the Chain directly to the Action:

  ```diff
  import { createWalletClient, custom, getAccount } from 'viem'
  import { mainnet } from 'viem/chains'

  export const walletClient = createWalletClient({
  - chain: mainnet,
    transport: custom(window.ethereum)
  })

  const account = getAccount('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266')

  const hash = await walletClient.sendTransaction({
    account,
  + chain: mainnet,
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: 1000000000000000000n
  })
  ```

- [#229](https://github.com/wevm/viem/pull/229) [`098f342`](https://github.com/wevm/viem/commit/098f3423ee84f9deb09c2c7d30e950a046c07ea9) Thanks [@jxom](https://github.com/jxom)! - **Breaking:** Updated utility type names to reflect their purposes:
  - `ExtractErrorNameFromAbi` is now `InferErrorName`
  - `ExtractEventNameFromAbi` is now `InferEventName`
  - `ExtractFunctionNameFromAbi` is now `InferFunctionName`
  - `ExtractItemNameFromAbi` is now `InferItemName`
  - `ExtractConstructorArgsFromAbi` is now `GetConstructorArgs`
  - `ExtractErrorArgsFromAbi` is now `GetErrorArgs`
  - `ExtractEventArgsFromAbi` is now `GetEventArgs`
  - `ExtractEventArgsFromTopics` is now `GetEventArgsFromTopics`
  - `ExtractArgsFromAbi` is now `GetFunctionArgs`

- [#229](https://github.com/wevm/viem/pull/229) [`098f342`](https://github.com/wevm/viem/commit/098f3423ee84f9deb09c2c7d30e950a046c07ea9) Thanks [@jxom](https://github.com/jxom)! - **Breaking:** The following functions are now `async` functions instead of synchronous functions:
  - `recoverAddress`
  - `recoverMessageAddress`
  - `verifyMessage`

  ```diff
  import { recoverMessageAddress } from 'viem'

  - recoverMessageAddress({ message: 'hello world', signature: '0x...' })
  + await recoverMessageAddress({ message: 'hello world', signature: '0x...' })
  ```

### Patch Changes

- [#229](https://github.com/wevm/viem/pull/229) [`098f342`](https://github.com/wevm/viem/commit/098f3423ee84f9deb09c2c7d30e950a046c07ea9) Thanks [@jxom](https://github.com/jxom)! - Added `getEnsText` & `getEnsAvatar`

- [#229](https://github.com/wevm/viem/pull/229) [`098f342`](https://github.com/wevm/viem/commit/098f3423ee84f9deb09c2c7d30e950a046c07ea9) Thanks [@jxom](https://github.com/jxom)! - Added Local Account implementations:
  - `privateKeyToAccount`
  - `mnemonicToAccount`
  - `hdKeyToAccount`

  If you were previously relying on the `viem/ethers` wallet adapter, you no longer need to use this.

  ```diff
  - import { Wallet } from 'ethers'
  - import { getAccount } from 'viem/ethers'
  + import { privateKeyToAccount } from 'viem/accounts'

  const privateKey = '0x...'
  - const account = getAccount(new Wallet(privateKey))
  + const account = privateKeyToAccount(privateKey)

  const client = createWalletClient({
    account,
    chain: mainnet,
    transport: http()
  })
  ```

- [#229](https://github.com/wevm/viem/pull/229) [`098f342`](https://github.com/wevm/viem/commit/098f3423ee84f9deb09c2c7d30e950a046c07ea9) Thanks [@jxom](https://github.com/jxom)! - Added WebSocket `eth_subscribe` support `watchBlocks`, `watchBlockNumber`, and `watchPendingTransactions`.

- [#229](https://github.com/wevm/viem/pull/229) [`098f342`](https://github.com/wevm/viem/commit/098f3423ee84f9deb09c2c7d30e950a046c07ea9) Thanks [@jxom](https://github.com/jxom)! - Updated Client types.

- [#229](https://github.com/wevm/viem/pull/229) [`098f342`](https://github.com/wevm/viem/commit/098f3423ee84f9deb09c2c7d30e950a046c07ea9) Thanks [@jxom](https://github.com/jxom)! - Added `verifyTypedData`, `hashTypedData`, `recoverTypedDataMessage`

- [#229](https://github.com/wevm/viem/pull/229) [`098f342`](https://github.com/wevm/viem/commit/098f3423ee84f9deb09c2c7d30e950a046c07ea9) Thanks [@jxom](https://github.com/jxom)! - Added the ability to hoist an Account to the Wallet Client.

  ```diff
  import { createWalletClient, http } from 'viem'
  import { mainnnet } from 'viem/chains'

  const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })

  const client = createWalletClient({
  + account,
    chain: mainnet,
    transport: http()
  })

  const hash = await client.sendTransaction({
  - account,
    to: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
    value: parseEther('0.001')
  })
  ```

- [#229](https://github.com/wevm/viem/pull/229) [`098f342`](https://github.com/wevm/viem/commit/098f3423ee84f9deb09c2c7d30e950a046c07ea9) Thanks [@jxom](https://github.com/jxom)! - Added getEnsResolver

## 0.1.26

### Patch Changes

- [`93e402d`](https://github.com/wevm/viem/commit/93e402d6fddabcb6966fd8f81d7176d71241e193) Thanks [@jxom](https://github.com/jxom)! - Fixed a `decodeAbiParameters` case where static arrays with a dynamic child would consume the size of the child instead of 32 bytes.

## 0.1.25

### Patch Changes

- [#263](https://github.com/wevm/viem/pull/263) [`53fda1a`](https://github.com/wevm/viem/commit/53fda1a5366ff1122b951d8148c1a9f74f280578) Thanks [@fubhy](https://github.com/fubhy)! - Fixed issue where ABIs with constructors would throw for `decodeFunctionData`.

## 0.1.24

### Patch Changes

- [#237](https://github.com/wevm/viem/pull/237) [`a92c4fa`](https://github.com/wevm/viem/commit/a92c4fa31eb4a71cb68edf6d50a58cf653419f86) Thanks [@jxom](https://github.com/jxom)! - Added automatic ranking to `fallback` Transport.

## 0.1.23

### Patch Changes

- [#251](https://github.com/wevm/viem/pull/251) [`153e97e`](https://github.com/wevm/viem/commit/153e97ed0461c34fd75fa7cad3820e9960f6810a) Thanks [@tmm](https://github.com/tmm)! - Fixed `signTypedData` inference for `primaryType` field.

## 0.1.22

### Patch Changes

- [`07000b6`](https://github.com/wevm/viem/commit/07000b650b6cce41c99a4ccf609f5fccce818244) Thanks [@jxom](https://github.com/jxom)! - Removed unnecessary trimming of decoded RLP hex value

## 0.1.21

### Patch Changes

- [#223](https://github.com/wevm/viem/pull/223) [`2e9c000`](https://github.com/wevm/viem/commit/2e9c0008c76939e54902569f8f8581a943914e4f) Thanks [@jxom](https://github.com/jxom)! - Added an assertion in `sendTransaction` & `writeContract` to check that the client chain matches the wallet's current chain.

## 0.1.20

### Patch Changes

- [#220](https://github.com/wevm/viem/pull/220) [`9a80fca`](https://github.com/wevm/viem/commit/9a80fca116417f77d4a305a59ec0c3ecf3e0fdfa) Thanks [@jxom](https://github.com/jxom)! - Fixed an issue where `watchEvent` would not emit events on missed blocks for the `getLogs` fallback.

## 0.1.19

### Patch Changes

- [`74f8e1d`](https://github.com/wevm/viem/commit/74f8e1dfe1b86eba9453ede0b20babf8e150423a) Thanks [@jxom](https://github.com/jxom)! - Added missing `recoverMessageAddress` and `verifyMessage` exports.

## 0.1.18

### Patch Changes

- [`9c45397`](https://github.com/wevm/viem/commit/9c4539756d138f196b368fd1ac8e1a926d9bace0) Thanks [@jxom](https://github.com/jxom)! - Fixed `signTypedData` support for Ethers.js v5 wallets

## 0.1.17

### Patch Changes

- [#213](https://github.com/wevm/viem/pull/213) [`46f823a`](https://github.com/wevm/viem/commit/46f823afd017b1421c66162d832080f8dc7711e1) Thanks [@jxom](https://github.com/jxom)! - Fixed return type for `allowFailure: false` on `multicall`

- [`1339b20`](https://github.com/wevm/viem/commit/1339b20f735cb18b397aa1910cdb288609612f14) Thanks [@jxom](https://github.com/jxom)! - Exported `Extract*FromAbi` types

- [`c3d932a`](https://github.com/wevm/viem/commit/c3d932ad69a0c54fb204d7878a1a96916d1193df) Thanks [@jxom](https://github.com/jxom)! - Fixed `signTypedData` support for Ethers.js v5 Wallets

## 0.1.16

### Patch Changes

- [#207](https://github.com/wevm/viem/pull/207) [`8e5768f`](https://github.com/wevm/viem/commit/8e5768ffa1d813810b99f5ed06a00bfe830b2a35) Thanks [@jxom](https://github.com/jxom)! - Added assertion in `watchBlocks` and `watchBlockNumber` to check that the next block number is higher than the previously seen block number.

- [#209](https://github.com/wevm/viem/pull/209) [`ae3e0b6`](https://github.com/wevm/viem/commit/ae3e0b62a21671bd749e20ec5d65d80fa7475adc) Thanks [@jxom](https://github.com/jxom)! - Added `verifyMessage`, `recoverAddress`, `recoverMessageAddress`, and `hashMessage`.

## 0.1.15

### Patch Changes

- [#205](https://github.com/wevm/viem/pull/205) [`36fa97a`](https://github.com/wevm/viem/commit/36fa97a595670825f1dee008ebf44abbc1402f2e) Thanks [@jxom](https://github.com/jxom)! - Added an assertion to check for existence of an event signature on `topics` for `decodeEventLog`

## 0.1.14

### Patch Changes

- [#198](https://github.com/wevm/viem/pull/198) [`e805e7e`](https://github.com/wevm/viem/commit/e805e7ebaa7c15ea21a49ac0759bf4ebe5284f72) Thanks [@wighawag](https://github.com/wighawag)! - Added an assertion in `decodeEventLog` to check for a mismatch between topics + indexed event parameters.

## 0.1.13

### Patch Changes

- [`56f2e03`](https://github.com/wevm/viem/commit/56f2e03837d64a9156766f0ef785ac50ba27380f) Thanks [@jxom](https://github.com/jxom)! - Added export for `concat`.

## 0.1.12

### Patch Changes

- [`c0e3617`](https://github.com/wevm/viem/commit/c0e3617b639ba84c03011430d69d72173da00466) Thanks [@jxom](https://github.com/jxom)! - Fixed `viem/ethers` entrypoint.

## 0.1.11

### Patch Changes

- [#88](https://github.com/wevm/viem/pull/88) [`5456490`](https://github.com/wevm/viem/commit/545649093422fb14a39418a7199766d033c9e175) Thanks [@jxom](https://github.com/jxom)! - Added `signTypedData`.

## 0.1.10

### Patch Changes

- [#178](https://github.com/wevm/viem/pull/178) [`eda1827`](https://github.com/wevm/viem/commit/eda182754ed2727bc652225e327760ab0a14a962) Thanks [@0xOlias](https://github.com/0xOlias)! - Fixed type of `topics` field on the `Log` type.

- [#181](https://github.com/wevm/viem/pull/181) [`8213be3`](https://github.com/wevm/viem/commit/8213be3676283ec80d0d5cbcee4864fe4d9c6b6e) Thanks [@tmm](https://github.com/tmm)! - Bumped abitype version.

## 0.1.9

### Patch Changes

- [#170](https://github.com/wevm/viem/pull/170) [`35a7508`](https://github.com/wevm/viem/commit/35a750839ae5ac41427e84922315ce3e360ee58a) Thanks [@jxom](https://github.com/jxom)! - Added inference for multicall address from client chain.

## 0.1.8

### Patch Changes

- [`36c908c`](https://github.com/wevm/viem/commit/36c908c65dcbca1a68841dfa8eb89963561431b1) Thanks [@jxom](https://github.com/jxom)! - Fixed an issue where empty strings were not being decoded properly in `decodeAbiParameters`.

## 0.1.7

### Patch Changes

- [#159](https://github.com/wevm/viem/pull/159) [`574ae22`](https://github.com/wevm/viem/commit/574ae2244c755519bda02b46d8767a365e1f4217) Thanks [@jxom](https://github.com/jxom)! - Fixed issue where decoding error logs would break if constructor was in ABI.

## 0.1.6

### Patch Changes

- [#153](https://github.com/wevm/viem/pull/153) [`bbb998a`](https://github.com/wevm/viem/commit/bbb998a6a1c2ce97a76e6275e1f07b6e2767b248) Thanks [@jxom](https://github.com/jxom)! - Formatted `undefined` values from RPC as `null` to conform to EIP-1474.

## 0.1.5

### Patch Changes

- [#141](https://github.com/wevm/viem/pull/141) [`450b612`](https://github.com/wevm/viem/commit/450b612289b832559ce11a9e2eba7dda68a7a981) Thanks [@unholypanda](https://github.com/unholypanda)! - Fixed `createPublicClient` to include `getTransactionCount`

## 0.1.4

### Patch Changes

- [#139](https://github.com/wevm/viem/pull/139) [`304a436`](https://github.com/wevm/viem/commit/304a4365dba9aa7be191ae4436b952eea9cfe79e) Thanks [@jxom](https://github.com/jxom)! - Added the following chains:
  - `baseGoerli`
  - `boba`
  - `filecoinCalibration`
  - `flare`
  - `flareTestnet`
  - `harmonyOne`
  - `moonbaseAlpha`
  - `moonbeam`
  - `moonriver`
  - `okc`
  - `polygonZkEvmTestnet`
  - `shardeumSphinx`
  - `songbird`
  - `songbirdTestnet`
  - `telos`
  - `telosTestnet`
  - `zhejiang`

## 0.1.3

### Patch Changes

- [#136](https://github.com/wevm/viem/pull/136) [`dcca090`](https://github.com/wevm/viem/commit/dcca0900556d45a5795af4f60ef070a54a6f0306) Thanks [@jxom](https://github.com/jxom)! - Fixed ABI encoding for strings larger than 32 bytes.

- [#136](https://github.com/wevm/viem/pull/136) [`dcca090`](https://github.com/wevm/viem/commit/dcca0900556d45a5795af4f60ef070a54a6f0306) Thanks [@jxom](https://github.com/jxom)! - Fixed emoji string encoding.

## 0.1.2

### Patch Changes

- [`637d252`](https://github.com/wevm/viem/commit/637d2523e3e259deb9538a0089c0c80bb37abf22) Thanks [@jxom](https://github.com/jxom)! - Bumped abitype to 0.6.7

## 0.1.1

### Patch Changes

- [#128](https://github.com/wevm/viem/pull/128) [`ef51936`](https://github.com/wevm/viem/commit/ef519364c28a2ec6571b5e8d13aced0c9123dc46) Thanks [@tmm](https://github.com/tmm)! - Fixed internal type compilation error.

## 0.1.0

### Minor Changes

- [`fec4460`](https://github.com/wevm/viem/commit/fec4460f63ac2c367722554cf910f1ee78b2795d) Thanks [@jxom](https://github.com/jxom)! - Initial release.

## 0.0.1-alpha.39

### Patch Changes

- [`68c3816`](https://github.com/wevm/viem/commit/68c3816c8c492aa0943b63438a13109e9ac682df) Thanks [@jxom](https://github.com/jxom)! - Added `encodePacked`.

- [`68c3816`](https://github.com/wevm/viem/commit/68c3816c8c492aa0943b63438a13109e9ac682df) Thanks [@jxom](https://github.com/jxom)! - Made `keccak256` accept a hex value (as well as byte array).

## 0.0.1-alpha.38

### Patch Changes

- [`59a60cb`](https://github.com/wevm/viem/commit/59a60cb8cc7d0109c08fa5906a24c6eb8e48b183) Thanks [@jxom](https://github.com/jxom)! - Fixed decoding zero data bytes

## 0.0.1-alpha.37

### Patch Changes

- [`e07f212`](https://github.com/wevm/viem/commit/e07f212af5ef94b938939f0205056c29747bb919) Thanks [@jxom](https://github.com/jxom)! - **Breaking:** Renamed `formatUnit` and `parseUnit` to `formatUnits` and `parseUnits`.

## 0.0.1-alpha.36

### Patch Changes

- [#100](https://github.com/wevm/viem/pull/100) [`6bb8ce4`](https://github.com/wevm/viem/commit/6bb8ce4eafff68989281f19fb315c0ea2f22b01a) Thanks [@jxom](https://github.com/jxom)! - **Breaking:** Renamed `requestAccounts` Wallet Action to `requestAddresses`

  **Breaking:** Renamed `getAccounts` Wallet Action to `getAddresses`

- [#100](https://github.com/wevm/viem/pull/100) [`6bb8ce4`](https://github.com/wevm/viem/commit/6bb8ce4eafff68989281f19fb315c0ea2f22b01a) Thanks [@jxom](https://github.com/jxom)! - Added support for Externally Owned Accounts.

- [#100](https://github.com/wevm/viem/pull/100) [`6bb8ce4`](https://github.com/wevm/viem/commit/6bb8ce4eafff68989281f19fb315c0ea2f22b01a) Thanks [@jxom](https://github.com/jxom)! - **Breaking:** The `from` argument has been removed from Actions in favour of `account` to distinguish between [Account types](https://viem.sh/docs/clients/wallet):

  ```diff
  + import { getAccount } from 'viem'

  const [address] = await walletClient.requestAddresses()
  + const account = getAccount(address)

  const hash = await walletClient.sendTransaction({
  - from: address,
  + account,
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: 1000000000000000000n
  })
  ```

  Affected actions:
  - `call`
  - `estimateGas`
  - `sendTransaction`
  - `signMessage`
  - `estimateContractGas`
  - `multicall`
  - `readContract`
  - `simulateContract`
  - `writeContract`

## 0.0.1-alpha.35

### Patch Changes

- [`057e01e`](https://github.com/wevm/viem/commit/057e01e9fff7346304e787d93053d84a09278335) Thanks [@jxom](https://github.com/jxom)! - - `testClient.getTxPoolContent` → `testClient.getTxpoolContent`
  - `testClient.getTxPoolStatus` → `testClient.getTxpoolStatus`

- [#85](https://github.com/wevm/viem/pull/85) [`2350d1a`](https://github.com/wevm/viem/commit/2350d1af1ff67d725ff3563538b9886a405ab8bd) Thanks [@jxom](https://github.com/jxom)! - **Breaking:** Renamed `encodeAbi` & `decodeAbi` to `encodeAbiParameters` & `decodeAbiParameters`, and modified API from named arguments to inplace arguments:

  ```diff
  import {
  - encodeAbi,
  - decodeAbi,
  + encodeAbiParameters,
  + decodeAbiParameters,
  } from 'viem'

  -const result = encodeAbi({ params, values })
  +const result = encodeAbiParameters(params, values)

  -const result = decodeAbi({ params, data })
  +const result = decodeAbiParameters(params, data)
  ```

## 0.0.1-alpha.34

### Patch Changes

- [`e1634b5`](https://github.com/wevm/viem/commit/e1634b5d110b1a39032eab9813f93244b04123ad) Thanks [@jxom](https://github.com/jxom)! - Fixed ABI encoding dynamic tuple child derivation

## 0.0.1-alpha.33

### Patch Changes

- [`1971e6a`](https://github.com/wevm/viem/commit/1971e6ad74df802bdbd988ddc5e6fc06fad66091) Thanks [@jxom](https://github.com/jxom)! - Added assertion to check if addresses are valid for `sendTransaction`, `estimateGas` & `call`.

## 0.0.1-alpha.32

### Patch Changes

- [`7243744`](https://github.com/wevm/viem/commit/7243744ecd230532b8f11d1766318a75760229e5) Thanks [@jxom](https://github.com/jxom)! - Added support for `4001` & `4902` RPC error codes.

## 0.0.1-alpha.31

### Patch Changes

- [#89](https://github.com/wevm/viem/pull/89) [`3e45853`](https://github.com/wevm/viem/commit/3e45853a2252e6a5496acae65c3cebecbdb4260f) Thanks [@jxom](https://github.com/jxom)! - Added `fetchOptions` to the `http` transport.

- [#91](https://github.com/wevm/viem/pull/91) [`0ac32c2`](https://github.com/wevm/viem/commit/0ac32c2852dc470aaba560623a2e169927a546d5) Thanks [@jxom](https://github.com/jxom)! - **Breaking:** Renamed `getFunctionSignature` and `getEventSignature` to `getFunctionSelector` and `getEventSelector`.

## 0.0.1-alpha.30

### Patch Changes

- [#81](https://github.com/wevm/viem/pull/81) [`eb572b0`](https://github.com/wevm/viem/commit/eb572b0a431606f8c31abb011cef08ad36d0836c) Thanks [@jxom](https://github.com/jxom)! - Improved transaction & contract error messaging & coalesce error messages from nodes.

## 0.0.1-alpha.29

### Patch Changes

- [`6bdee9c`](https://github.com/wevm/viem/commit/6bdee9c8dde1c06ebde769c50c1002b2cca0a0f9) Thanks [@jxom](https://github.com/jxom)! - Fixed issue where fallback transport was not falling back on timeouts

## 0.0.1-alpha.28

### Patch Changes

- [`8ef068b`](https://github.com/wevm/viem/commit/8ef068b024d90b1a62e34b6556268d6a38514eb3) Thanks [@jxom](https://github.com/jxom)! - Added `502`, `503` and `504` error codes as "non-deterministic" errors for `fallback` transport & retries.

- [#79](https://github.com/wevm/viem/pull/79) [`db9caa9`](https://github.com/wevm/viem/commit/db9caa98fb7cf8592940c1c2e4d41b678b70240c) Thanks [@jxom](https://github.com/jxom)! - Added `timeout` as a config option to the `http` and `webSocket` Transports.

- [#77](https://github.com/wevm/viem/pull/77) [`d6a29f5`](https://github.com/wevm/viem/commit/d6a29f5223324660cd98c2a6aaf345c207b2cd97) Thanks [@jxom](https://github.com/jxom)! - Decorated Clients with their respective Actions.

  Example:

  ```diff
  import { createPublicClient, http } from 'viem'
  import { mainnet } from 'viem/chains'
  -import { getBlockNumber } from 'viem/public'

  const client = createPublicClient({
    chain: mainnet,
    transport: http(),
  })

  - const blockNumber = await getBlockNumber(client)
  + const blockNumber = await client.getBlockNumber()
  ```

## 0.0.1-alpha.26

### Patch Changes

**Breaking**: Renamed encoding utils.

- `encodeBytes`/`decodeBytes` → `toBytes`/`fromBytes`
- `encodeHex`/`decodeHex` → `toHex`/`fromHex`
- `encodeRlp`/`decodeRlp` → `toRlp`/`fromRlp`

## 0.0.1-alpha.26

### Patch Changes

- [`7d9a241`](https://github.com/wevm/viem/commit/7d9a2413805b142611d29d7e5faddd44ae3c047c) Thanks [@jxom](https://github.com/jxom)! - Added `estimateContractGas`.

- [`7d9a241`](https://github.com/wevm/viem/commit/7d9a2413805b142611d29d7e5faddd44ae3c047c) Thanks [@jxom](https://github.com/jxom)! - Added `retryCount` and `retryDelay` config to Transports.

## 0.0.1-alpha.25

### Patch Changes

- [`6c902f8`](https://github.com/wevm/viem/commit/6c902f86e2067dcd366434722429fe873c8d6089) Thanks [@jxom](https://github.com/jxom)! - Added `decodeEventLog`.

- [#68](https://github.com/wevm/viem/pull/68) [`1be77b3`](https://github.com/wevm/viem/commit/1be77b3e7f454ae6085daefe1f24ca9f757334f8) Thanks [@jxom](https://github.com/jxom)! - **Breaking:** Removed all public/wallet/test actions & utils from the `viem` entrypoint to their respective entrypoints:
  - `viem` = Clients & Transport exports
  - `viem/chains` = Chains exports
  - `viem/contract` = Contract Actions & Utils exports
  - `viem/ens` = ENS Actions & Utils exports
  - `viem/public` = Public Actions exports
  - `viem/test` = Test Actions exports
  - `viem/utils` = Utils exports
  - `viem/wallet` = Wallet Actions exports

- [#66](https://github.com/wevm/viem/pull/66) [`f19fc32`](https://github.com/wevm/viem/commit/f19fc329bd7bad7639824fcf65387be542facc83) Thanks [@tmm](https://github.com/tmm)! - Added ENS actions `getEnsAddress` and `getEnsName`.

## 0.0.1-alpha.24

### Patch Changes

- [#63](https://github.com/wevm/viem/pull/63) [`7473582`](https://github.com/wevm/viem/commit/7473582aff91c6c717ee112743c45dc4cf5dd543) Thanks [@tmm](https://github.com/tmm)! - Exported missing `watchContractEvent` and `watchEvent` actions.

## 0.0.1-alpha.23

### Patch Changes

- [#61](https://github.com/wevm/viem/pull/61) [`e4b2dbb`](https://github.com/wevm/viem/commit/e4b2dbb67e5b9f7f8d703191207931042127ebce) Thanks [@tmm](https://github.com/tmm)! - Exported multicall action

## 0.0.1-alpha.22

### Patch Changes

- [#57](https://github.com/wevm/viem/pull/57) [`40c76e3`](https://github.com/wevm/viem/commit/40c76e3ac4478ee1e5c739d8162eb2006e3679e0) Thanks [@jxom](https://github.com/jxom)! - support `Panic` & custom contract errors

- [#56](https://github.com/wevm/viem/pull/56) [`3e90197`](https://github.com/wevm/viem/commit/3e90197bbac1ea571876d316a8667f4a00e84e9f) Thanks [@jxom](https://github.com/jxom)! - - **Breaking**: Renamed `humanMessage` to `shortMessage` in `BaseError`.
  - Added `multicall`.
  - Support overloaded contract functions.

## 0.0.1-alpha.21

### Patch Changes

- [`5a6bdf8`](https://github.com/wevm/viem/commit/5a6bdf8ea034b7edf6b2207b525764cee43bdb4b) Thanks [@jxom](https://github.com/jxom)! - Fixed an issue where `encodeAbi` couldn't encode dynamic bytes larger than 32 bytes"

## 0.0.1-alpha.20

### Patch Changes

- [`ebf1dc8`](https://github.com/wevm/viem/commit/ebf1dc8e4785fd8115687995916882caa94f7ecd) Thanks [@jxom](https://github.com/jxom)! - Added `watchEvent`

- [`ebf1dc8`](https://github.com/wevm/viem/commit/ebf1dc8e4785fd8115687995916882caa94f7ecd) Thanks [@jxom](https://github.com/jxom)! - Added `watchContractEvent`

- [`ae90357`](https://github.com/wevm/viem/commit/ae9035735590b09e375dd4f773dd8b5e6c953fab) Thanks [@jxom](https://github.com/jxom)! - Made `watchBlocks` more type safe with the `includeTransactions` arg.

## 0.0.1-alpha.19

### Patch Changes

- [`2028985`](https://github.com/wevm/viem/commit/202898521d4c211d73f8194c642c62a9baa57a46) Thanks [@jxom](https://github.com/jxom)! - Added `getStorageAt`

## 0.0.1-alpha.18

### Patch Changes

- [`7afdee8`](https://github.com/wevm/viem/commit/7afdee87cda6cebeeb9446773b6373ab680f7207) Thanks [@jxom](https://github.com/jxom)! - Added `readContract`

## 0.0.1-alpha.17

### Patch Changes

- [`ac69d16`](https://github.com/wevm/viem/commit/ac69d1675e70624919dc564f73ab91064c683a52) Thanks [@jxom](https://github.com/jxom)! - Added `writeContract`.

- [`ac69d16`](https://github.com/wevm/viem/commit/ac69d1675e70624919dc564f73ab91064c683a52) Thanks [@jxom](https://github.com/jxom)! - **Breaking**: Replaced `callContract` with `simulateContract`.

- [#44](https://github.com/wevm/viem/pull/44) [`f908190`](https://github.com/wevm/viem/commit/f90819098e11a2415d1220a6e857c45b09450885) Thanks [@0xOlias](https://github.com/0xOlias)! - Added `getLogs` action.

## 0.0.1-alpha.16

### Patch Changes

- [`9f386f5`](https://github.com/wevm/viem/commit/9f386f5737a228a57d1376992cd5a1374ed69262) Thanks [@jxom](https://github.com/jxom)! - Added sourcemaps

## 0.0.1-alpha.15

### Patch Changes

- [`a74d643`](https://github.com/wevm/viem/commit/a74d6438d3a1263b3b6616e0b7ec80791945c870) Thanks [@jxom](https://github.com/jxom)! - **Breaking**: Removed the `viem/actions` export in favor of `viem/public`, `viem/test` & `viem/wallet` exports.

## 0.0.1-alpha.14

### Patch Changes

- [`257c8f3`](https://github.com/wevm/viem/commit/257c8f34c83a05da7226fd84565535ffe4dc4a6a) Thanks [@jxom](https://github.com/jxom)! - Added `getBytecode`.

## 0.0.1-alpha.13

### Patch Changes

- [`8799a49`](https://github.com/wevm/viem/commit/8799a490b8b08fb90cd6edcdc1551f6b6e96bc64) Thanks [@jxom](https://github.com/jxom)! - Added `deployContract`

## 0.0.1-alpha.12

### Patch Changes

- [`6a47671`](https://github.com/wevm/viem/commit/6a47671ce9fe01f01cb744d85ac4e12674ef5b36) Thanks [@jxom](https://github.com/jxom)! - Fixed published `package.json`.

## 0.0.1-alpha.11

### Patch Changes

- [#37](https://github.com/wevm/viem/pull/37) [`32e2b76`](https://github.com/wevm/viem/commit/32e2b7649697a8143e1e6f2c2080570fb6b1a80b) Thanks [@jxom](https://github.com/jxom)! - Support CJS

- [`43700d9`](https://github.com/wevm/viem/commit/43700d94660ee2478d867fcf4abcc0dac64f90d0) Thanks [@jxom](https://github.com/jxom)! - Fixed issue where preinstall/postinstall scripts were being published to NPM.

## 0.0.1-alpha.10

### Patch Changes

- [#31](https://github.com/wevm/viem/pull/31) [`1f65640`](https://github.com/wevm/viem/commit/1f65640caa44957f38f68971e9b56d8e9229031d) Thanks [@jxom](https://github.com/jxom)! - Added initial `callContract` implementation

## 0.0.1-alpha.9

### Patch Changes

- [`976fd86`](https://github.com/wevm/viem/commit/976fd86ed55cb1931ba619c116db2753cf72a10b) Thanks [@jxom](https://github.com/jxom)! - Added `decodeDeployData`.

## 0.0.1-alpha.8

### Patch Changes

- [`9120e26`](https://github.com/wevm/viem/commit/9120e26fabe5d70ef13be7bc6eabfc966e3c4a29) Thanks [@jxom](https://github.com/jxom)! - Added `encodeErrorResult`.

## 0.0.1-alpha.7

### Patch Changes

- [`c52ce66`](https://github.com/wevm/viem/commit/c52ce660d62f3d44499ea13b88a883b76dd5fe08) Thanks [@jxom](https://github.com/jxom)! - Added `decodeErrorResult`.

- [`497b0b1`](https://github.com/wevm/viem/commit/497b0b1ce4c3585092fda1b6a9fd0526a0414c4d) Thanks [@jxom](https://github.com/jxom)! - Added `encodeEventTopics`.

## 0.0.1-alpha.6

### Patch Changes

- [`94b32ab`](https://github.com/wevm/viem/commit/94b32ab85be156bf25fd64056532edc1d4441c70) Thanks [@jxom](https://github.com/jxom)! - Added `encodeDeployData`.

## 0.0.1-alpha.5

### Patch Changes

- [`ee4d256`](https://github.com/wevm/viem/commit/ee4d256a50e4312614501b15c6b5f9b7b3220be3) Thanks [@jxom](https://github.com/jxom)! - Added `encodeFunctionResult`.

## 0.0.1-alpha.4

### Patch Changes

- [`f2e6bb1`](https://github.com/wevm/viem/commit/f2e6bb1fee06ccd51c7b3a22accd01259daece0f) Thanks [@jxom](https://github.com/jxom)! - Added `decodeFunctionResult`.

## 0.0.1-alpha.3

### Patch Changes

- [`849653f`](https://github.com/wevm/viem/commit/849653f246422c75487c141e94509920563f6706) Thanks [@jxom](https://github.com/jxom)! - - **Breaking**: Renamed `encodeFunctionParams` to `encodeFunctionData`.
  - Added `decodeFunctionData`.

## 0.0.1-alpha.2

### Patch Changes

- [#18](https://github.com/wevm/viem/pull/18) [`bb9e88a`](https://github.com/wevm/viem/commit/bb9e88a7fd1156550fe69a37d82fc67f2f63439b) Thanks [@jxom](https://github.com/jxom)! - Added `encodeFunctionParams`.

## 0.0.1-alpha.1

### Patch Changes

- [`d722728`](https://github.com/wevm/viem/commit/d722728e8d54065b5f9882ec6146c194de4b3c62) Thanks [@jxom](https://github.com/jxom)! - - **Breaking**: Renamed `ethereumProvider` Transport to `custom`.
  - **Breaking**: Refactored Transport APIs.
  - **Breaking**: Flattened `sendTransaction`, `call` & `estimateGas` APIs.
  - Added `encodeAbi` & `decodeAbi`.
  - Added `fallback` Transport.
  - Added `getFilterLogs`.
