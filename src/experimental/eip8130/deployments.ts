import type { Address } from 'abitype'

/**
 * On-chain addresses for an EIP-8130 deployment ([base/eip-8130](https://github.com/base/eip-8130)).
 *
 * On chains **without** native EIP-8130 support, these contracts provide the
 * portable path: `accountConfiguration` is the ERC-4337 factory / config
 * registry, `accounts` are the wallet implementations (proxied via ERC-1167),
 * and `authenticators` are the deployed authenticator contracts used during EVM
 * execution (native chains use the protocol sentinels instead).
 */
export type Eip8130Deployment = {
  /** AccountConfiguration system contract (factory + actor-config registry). */
  accountConfiguration: Address
  /** Wallet implementation contracts (deployed behind ERC-1167 proxies). */
  accounts: {
    /** DefaultAccount implementation. */
    default: Address
    /** DefaultHighRateAccount implementation. */
    defaultHighRate: Address
    /** BackwardCompatibleERC4337Account — pass to {@link toSmartAccount8130}. */
    erc4337: Address
  }
  /** Deployed authenticator contracts (for EVM execution on non-native chains). */
  authenticators: {
    /** secp256k1. Note: the native 8130 path uses `ECRECOVER_AUTHENTICATOR` (`address(1)`). */
    k1: Address
    p256: Address
    webAuthn: Address
    delegate: Address
    alwaysValid: Address
  }
}

/** EIP-8130 deployment on Base Sepolia (chain id `84532`). */
export const baseSepoliaDeployment = {
  accountConfiguration: '0xb0198a714872EE5bfDF829e7986DB5C5899a6b50',
  accounts: {
    default: '0x124b52d5D57a76ed064c414975beA11Beffe0251',
    defaultHighRate: '0x13dD0F222cCF60B7C08a95C2d1FcC85A38DD675D',
    erc4337: '0x9748aeA1e1762E50a4d8927777FeDB63A2Ef06C0',
  },
  authenticators: {
    k1: '0x39221FB37Df105B22316328e88632C9684861466',
    p256: '0x3AE129D846CD1CAf0369b4Caa56c188E18E11B15',
    webAuthn: '0x1CB75BE39Fb950202BF4239010534B86EdA66c31',
    delegate: '0xE67D299Ff3F0a185398B6C5a28998696969265d7',
    alwaysValid: '0x520fBA4840729CB57b3Dc7B40D548AcF354DBA25',
  },
} as const satisfies Eip8130Deployment

/** Known EIP-8130 deployments, keyed by chain id. */
export const eip8130Deployments: Record<number, Eip8130Deployment> = {
  84532: baseSepoliaDeployment,
}

/** Returns the EIP-8130 deployment for a chain id, if known. */
export function getEip8130Deployment(
  chainId: number,
): Eip8130Deployment | undefined {
  return eip8130Deployments[chainId]
}
