import type { Address } from 'abitype'
import type { Hex } from '../../types/misc.js'
import { concatHex } from '../../utils/data/concat.js'

/**
 * Builds the 45-byte ERC-1167 minimal proxy runtime bytecode that delegates to
 * `implementation`. This is the `code` deployed at an **immutable** EIP-8130
 * account address (e.g. `DefaultHighRateAccount`). See {@link computeAddress}
 * and {@link toFactoryArgs}.
 */
export function erc1167Bytecode(implementation: Address): Hex {
  return concatHex([
    '0x363d3d373d3d3d363d73',
    implementation,
    '0x5af43d82803e903d91602b57fd5bf3',
  ])
}

/**
 * Builds the 93-byte `UpgradeableProxy` runtime bytecode: an ERC-1967 proxy with
 * a hardcoded default `implementation`. This is the `code` deployed at an
 * **upgradeable** EIP-8130 account address (a {@link https://github.com/base/smart-wallet-v2/blob/master/src/CoinbaseSmartWalletV2.sol CoinbaseSmartWalletV2}
 * account), and the per-account counterpart to the singleton implementation it
 * delegates to.
 *
 * Proxy logic (see [base/smart-wallet-v2 `UpgradeableProxy`](https://github.com/base/smart-wallet-v2/blob/master/src/proxy/UpgradeableProxy.sol)):
 * 1. `SLOAD` the ERC-1967 implementation slot.
 * 2. If non-zero, `delegatecall` to that address (the upgraded path).
 * 3. If zero, `delegatecall` to the hardcoded default (a fresh account).
 *
 * Pass a `CoinbaseSmartWalletV2` implementation — only a UUPS-capable
 * implementation can ever write the slot this proxy reads (via CBSW v2's
 * admin-gated `upgrade`). Immutable accounts use {@link erc1167Bytecode} instead.
 * For a 7702-delegated EOA, the singleton {@link https://github.com/base/smart-wallet-v2/blob/master/src/proxy/EIP7702ProxyForEIP8130.sol EIP7702ProxyForEIP8130}
 * is the delegation target (CBSW v2 as its default implementation).
 */
export function upgradeableProxyBytecode(implementation: Address): Hex {
  return concatHex([
    // PUSH32 ERC1967_SLOT; SLOAD; DUP1; ISZERO; PUSH2 default(0x002c); JUMPI;
    // PUSH2 delegate(0x0043); JUMP
    '0x7f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc',
    '0x5480156100',
    '0x2c',
    '0x576100',
    '0x4356',
    // default_label: JUMPDEST; POP; PUSH20 <implementation>
    '0x5b5073',
    implementation,
    // delegate_label: JUMPDEST; delegatecall; return/revert
    '0x5b363d3d373d3d3d363d855af43d82803e903d91605b57fd5bf3',
  ])
}
