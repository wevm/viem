# viem

## 0.0.1-alpha.26

### Patch Changes

- [`7d9a241`](https://github.com/wagmi-dev/viem/commit/7d9a2413805b142611d29d7e5faddd44ae3c047c) Thanks [@jxom](https://github.com/jxom)! - Added `estimateContractGas`.

* [`7d9a241`](https://github.com/wagmi-dev/viem/commit/7d9a2413805b142611d29d7e5faddd44ae3c047c) Thanks [@jxom](https://github.com/jxom)! - Added `retryCount` and `retryDelay` config to Transports.

## 0.0.1-alpha.25

### Patch Changes

- [`6c902f8`](https://github.com/wagmi-dev/viem/commit/6c902f86e2067dcd366434722429fe873c8d6089) Thanks [@jxom](https://github.com/jxom)! - Added `decodeEventLog`.

* [#68](https://github.com/wagmi-dev/viem/pull/68) [`1be77b3`](https://github.com/wagmi-dev/viem/commit/1be77b3e7f454ae6085daefe1f24ca9f757334f8) Thanks [@jxom](https://github.com/jxom)! - **Breaking:** Removed all public/wallet/test actions & utils from the `viem` entrypoint to their respective entrypoints:

  - `viem` = Clients & Transport exports
  - `viem/chains` = Chains exports
  - `viem/contract` = Contract Actions & Utils exports
  - `viem/ens` = ENS Actions & Utils exports
  - `viem/public` = Public Actions exports
  - `viem/test` = Test Actions exports
  - `viem/utils` = Utils exports
  - `viem/wallet` = Wallet Actions exports

- [#66](https://github.com/wagmi-dev/viem/pull/66) [`f19fc32`](https://github.com/wagmi-dev/viem/commit/f19fc329bd7bad7639824fcf65387be542facc83) Thanks [@tmm](https://github.com/tmm)! - Added ENS actions `getEnsAddress` and `getEnsName`.

## 0.0.1-alpha.24

### Patch Changes

- [#63](https://github.com/wagmi-dev/viem/pull/63) [`7473582`](https://github.com/wagmi-dev/viem/commit/7473582aff91c6c717ee112743c45dc4cf5dd543) Thanks [@tmm](https://github.com/tmm)! - Exported missing `watchContractEvent` and `watchEvent` actions.

## 0.0.1-alpha.23

### Patch Changes

- [#61](https://github.com/wagmi-dev/viem/pull/61) [`e4b2dbb`](https://github.com/wagmi-dev/viem/commit/e4b2dbb67e5b9f7f8d703191207931042127ebce) Thanks [@tmm](https://github.com/tmm)! - Exported multicall action

## 0.0.1-alpha.22

### Patch Changes

- [#57](https://github.com/wagmi-dev/viem/pull/57) [`40c76e3`](https://github.com/wagmi-dev/viem/commit/40c76e3ac4478ee1e5c739d8162eb2006e3679e0) Thanks [@jxom](https://github.com/jxom)! - support `Panic` & custom contract errors

* [#56](https://github.com/wagmi-dev/viem/pull/56) [`3e90197`](https://github.com/wagmi-dev/viem/commit/3e90197bbac1ea571876d316a8667f4a00e84e9f) Thanks [@jxom](https://github.com/jxom)! - - **Breaking**: Renamed `humanMessage` to `shortMessage` in `BaseError`.
  - Added `multicall`.
  - Support overloaded contract functions.

## 0.0.1-alpha.21

### Patch Changes

- [`5a6bdf8`](https://github.com/wagmi-dev/viem/commit/5a6bdf8ea034b7edf6b2207b525764cee43bdb4b) Thanks [@jxom](https://github.com/jxom)! - Fixed an issue where `encodeAbi` couldn't encode dynamic bytes larger than 32 bytes"

## 0.0.1-alpha.20

### Patch Changes

- [`ebf1dc8`](https://github.com/wagmi-dev/viem/commit/ebf1dc8e4785fd8115687995916882caa94f7ecd) Thanks [@jxom](https://github.com/jxom)! - Added `watchEvent`

* [`ebf1dc8`](https://github.com/wagmi-dev/viem/commit/ebf1dc8e4785fd8115687995916882caa94f7ecd) Thanks [@jxom](https://github.com/jxom)! - Added `watchContractEvent`

- [`ae90357`](https://github.com/wagmi-dev/viem/commit/ae9035735590b09e375dd4f773dd8b5e6c953fab) Thanks [@jxom](https://github.com/jxom)! - Made `watchBlocks` more type safe with the `includeTransactions` arg.

## 0.0.1-alpha.19

### Patch Changes

- [`2028985`](https://github.com/wagmi-dev/viem/commit/202898521d4c211d73f8194c642c62a9baa57a46) Thanks [@jxom](https://github.com/jxom)! - Added `getStorageAt`

## 0.0.1-alpha.18

### Patch Changes

- [`7afdee8`](https://github.com/wagmi-dev/viem/commit/7afdee87cda6cebeeb9446773b6373ab680f7207) Thanks [@jxom](https://github.com/jxom)! - Added `readContract`

## 0.0.1-alpha.17

### Patch Changes

- [`ac69d16`](https://github.com/wagmi-dev/viem/commit/ac69d1675e70624919dc564f73ab91064c683a52) Thanks [@jxom](https://github.com/jxom)! - Added `writeContract`.

* [`ac69d16`](https://github.com/wagmi-dev/viem/commit/ac69d1675e70624919dc564f73ab91064c683a52) Thanks [@jxom](https://github.com/jxom)! - **Breaking**: Replaced `callContract` with `simulateContract`.

- [#44](https://github.com/wagmi-dev/viem/pull/44) [`f908190`](https://github.com/wagmi-dev/viem/commit/f90819098e11a2415d1220a6e857c45b09450885) Thanks [@0xOlias](https://github.com/0xOlias)! - Added `getLogs` action.

## 0.0.1-alpha.16

### Patch Changes

- [`9f386f5`](https://github.com/wagmi-dev/viem/commit/9f386f5737a228a57d1376992cd5a1374ed69262) Thanks [@jxom](https://github.com/jxom)! - Added sourcemaps

## 0.0.1-alpha.15

### Patch Changes

- [`a74d643`](https://github.com/wagmi-dev/viem/commit/a74d6438d3a1263b3b6616e0b7ec80791945c870) Thanks [@jxom](https://github.com/jxom)! - **Breaking**: Removed the `viem/actions` export in favor of `viem/public`, `viem/test` & `viem/wallet` exports.

## 0.0.1-alpha.14

### Patch Changes

- [`257c8f3`](https://github.com/wagmi-dev/viem/commit/257c8f34c83a05da7226fd84565535ffe4dc4a6a) Thanks [@jxom](https://github.com/jxom)! - Added `getBytecode`.

## 0.0.1-alpha.13

### Patch Changes

- [`8799a49`](https://github.com/wagmi-dev/viem/commit/8799a490b8b08fb90cd6edcdc1551f6b6e96bc64) Thanks [@jxom](https://github.com/jxom)! - Added `deployContract`

## 0.0.1-alpha.12

### Patch Changes

- [`6a47671`](https://github.com/wagmi-dev/viem/commit/6a47671ce9fe01f01cb744d85ac4e12674ef5b36) Thanks [@jxom](https://github.com/jxom)! - Fixed published `package.json`.

## 0.0.1-alpha.11

### Patch Changes

- [#37](https://github.com/wagmi-dev/viem/pull/37) [`32e2b76`](https://github.com/wagmi-dev/viem/commit/32e2b7649697a8143e1e6f2c2080570fb6b1a80b) Thanks [@jxom](https://github.com/jxom)! - Support CJS

* [`43700d9`](https://github.com/wagmi-dev/viem/commit/43700d94660ee2478d867fcf4abcc0dac64f90d0) Thanks [@jxom](https://github.com/jxom)! - Fixed issue where preinstall/postinstall scripts were being published to NPM.

## 0.0.1-alpha.10

### Patch Changes

- [#31](https://github.com/wagmi-dev/viem/pull/31) [`1f65640`](https://github.com/wagmi-dev/viem/commit/1f65640caa44957f38f68971e9b56d8e9229031d) Thanks [@jxom](https://github.com/jxom)! - Added initial `callContract` implementation

## 0.0.1-alpha.9

### Patch Changes

- [`976fd86`](https://github.com/wagmi-dev/viem/commit/976fd86ed55cb1931ba619c116db2753cf72a10b) Thanks [@jxom](https://github.com/jxom)! - Added `decodeDeployData`.

## 0.0.1-alpha.8

### Patch Changes

- [`9120e26`](https://github.com/wagmi-dev/viem/commit/9120e26fabe5d70ef13be7bc6eabfc966e3c4a29) Thanks [@jxom](https://github.com/jxom)! - Added `encodeErrorResult`.

## 0.0.1-alpha.7

### Patch Changes

- [`c52ce66`](https://github.com/wagmi-dev/viem/commit/c52ce660d62f3d44499ea13b88a883b76dd5fe08) Thanks [@jxom](https://github.com/jxom)! - Added `decodeErrorResult`.

* [`497b0b1`](https://github.com/wagmi-dev/viem/commit/497b0b1ce4c3585092fda1b6a9fd0526a0414c4d) Thanks [@jxom](https://github.com/jxom)! - Added `encodeEventTopics`.

## 0.0.1-alpha.6

### Patch Changes

- [`94b32ab`](https://github.com/wagmi-dev/viem/commit/94b32ab85be156bf25fd64056532edc1d4441c70) Thanks [@jxom](https://github.com/jxom)! - Added `encodeDeployData`.

## 0.0.1-alpha.5

### Patch Changes

- [`ee4d256`](https://github.com/wagmi-dev/viem/commit/ee4d256a50e4312614501b15c6b5f9b7b3220be3) Thanks [@jxom](https://github.com/jxom)! - Added `encodeFunctionResult`.

## 0.0.1-alpha.4

### Patch Changes

- [`f2e6bb1`](https://github.com/wagmi-dev/viem/commit/f2e6bb1fee06ccd51c7b3a22accd01259daece0f) Thanks [@jxom](https://github.com/jxom)! - Added `decodeFunctionResult`.

## 0.0.1-alpha.3

### Patch Changes

- [`849653f`](https://github.com/wagmi-dev/viem/commit/849653f246422c75487c141e94509920563f6706) Thanks [@jxom](https://github.com/jxom)! - - **Breaking**: Renamed `encodeFunctionParams` to `encodeFunctionData`.
  - Added `decodeFunctionData`.

## 0.0.1-alpha.2

### Patch Changes

- [#18](https://github.com/wagmi-dev/viem/pull/18) [`bb9e88a`](https://github.com/wagmi-dev/viem/commit/bb9e88a7fd1156550fe69a37d82fc67f2f63439b) Thanks [@jxom](https://github.com/jxom)! - Added `encodeFunctionParams`.

## 0.0.1-alpha.1

### Patch Changes

- [`d722728`](https://github.com/wagmi-dev/viem/commit/d722728e8d54065b5f9882ec6146c194de4b3c62) Thanks [@jxom](https://github.com/jxom)! - - **Breaking**: Renamed `ethereumProvider` Transport to `custom`.
  - **Breaking**: Refactored Transport APIs.
  - **Breaking**: Flattened `sendTransaction`, `call` & `estimateGas` APIs.
  - Added `encodeAbi` & `decodeAbi`.
  - Added `fallback` Transport.
  - Added `getFilterLogs`.
