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
  accountConfiguration: '0xe6BB4A62034c4F7494A411E28d0a18B1BB55DEE6',
  accounts: {
    default: '0xE69fca5270f01c40E9884E503a9961195438E6fD',
    defaultHighRate: '0x8aba250115EAE82A9C3df830DF8B47b255a593a4',
    erc4337: '0x1feBaCc134664AaCf8C15910460426699F1Ef92b',
  },
  authenticators: {
    k1: '0x39221FB37Df105B22316328e88632C9684861466',
    p256: '0x3AE129D846CD1CAf0369b4Caa56c188E18E11B15',
    webAuthn: '0x1CB75BE39Fb950202BF4239010534B86EdA66c31',
    delegate: '0x0d10CfB3D0CD016bf20b7254C4a869FBbc0ad8C7',
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
