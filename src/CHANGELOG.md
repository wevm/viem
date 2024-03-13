# viem

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

  This adapter was introduced when viem did not have Private Key & HD Accounts. Since 0.2, viem provides all the utilities needed to create and import [Private Key](https://viem.sh/docs/accounts/privateKey) & [HD Accounts](https://viem.sh/docs/accounts/mnemonic).

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

  > Note: viem 0.2.0 now has a [Private Key](/docs/accounts/privateKey) & [Mnemonic Account](/docs/accounts/mnemonic) implementation. You probably do not need this adapter anymore. This adapter may be removed in a future version.

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
