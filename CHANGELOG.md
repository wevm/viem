# viem

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
