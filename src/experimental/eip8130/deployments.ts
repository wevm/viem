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
    /** UpgradeableAccount implementation (proxied; upgradeable wallet logic). */
    upgradeable: Address
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
  /**
   * Example actor-policy contracts (unaudited reference). A restricted actor is
   * gated to the `manager`; the manager forwards committed call plans built by
   * the policy. See `viem/experimental/eip8130` policy helpers.
   */
  policies?: {
    /** PolicyManager — the single target a policy-gated actor may call. */
    manager: Address
    /**
     * SessionPolicy — unified session-key policy (target allowlist + selector
     * rules + recipient allowlists + per-token/native spend limits).
     */
    sessionPolicy: Address
  }
}

/**
 * Canonical EIP-8130 deployment addresses, derived deterministically from
 * `base/eip-8130` contract bytecode compiled with **solc 0.8.33** via
 * `Deploy.s.sol`. These addresses are identical on every chain that runs the
 * same bytecode (Base Sepolia, vibenet devnet, mainnet when live).
 *
 * `accountConfiguration` is enshrined in the execution client; using any other
 * value derives a different account address and the create transaction fails.
 *
 * When the `base/eip-8130` contracts are recompiled (e.g. Solidity upgrade or
 * bytecode change), all addresses must be re-derived and this object updated.
 */
const canonicalEip8130Deployment = {
  accountConfiguration: '0xC6595B992AF49099B476690d4D7CAb7D1890388F',
  accounts: {
    default: '0xca8D7419FEC024a5CEDB8D427615f3A74E3ebA6b',
    defaultHighRate: '0x9bB1a51927A7B8Fc433956E1a417DB9f97465527',
    erc4337: '0xe8e6317b1440ead4a3fc93e17cee77324a509923',
    upgradeable: '0x7Cf83aB369Fefabe2C9cb6D7C9DE816cc4f68Ea',
  },
  authenticators: {
    k1: '0x0000000000000000000000000000000000000001',
    p256: '0x3AE129D846CD1CAf0369b4Caa56c188E18E11B15',
    webAuthn: '0x1CB75BE39Fb950202BF4239010534B86EdA66c31',
    delegate: '0xCc81575121084c3538773478577e04CA7e9b35B1',
    alwaysValid: '0x520fBA4840729CB57b3Dc7B40D548AcF354DBA25',
  },
  policies: {
    manager: '0x95540b6dA4EaEf672c767477e84EeEa94E318135',
    sessionPolicy: '0x1577b86A7F621B2274909BeD3D9e7dE2a008151C',
  },
} as const satisfies Eip8130Deployment

/** EIP-8130 deployment on Base Sepolia (chain id `84532`). */
export const baseSepoliaDeployment = canonicalEip8130Deployment

/**
 * EIP-8130 deployment for the Base "vibenet" devnet (chain id `84538453`).
 *
 * The devnet runs EIP-8130 **natively** and the execution client enshrines the
 * canonical CREATE2 addresses (solc 0.8.33 via `Deploy.s.sol`), identical to
 * Base Sepolia and every other supported chain. Using any other
 * `accountConfiguration` derives a different account address and create
 * transactions fail with "create address mismatch".
 */
export const vibenetDevnetDeployment = canonicalEip8130Deployment

/** Known EIP-8130 deployments, keyed by chain id. */
export const eip8130Deployments: Record<number, Eip8130Deployment> = {
  84532: baseSepoliaDeployment,
  84538453: vibenetDevnetDeployment,
}

/** Returns the EIP-8130 deployment for a chain id, if known. */
export function getEip8130Deployment(
  chainId: number,
): Eip8130Deployment | undefined {
  return eip8130Deployments[chainId]
}
