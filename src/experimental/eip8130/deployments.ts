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

/** EIP-8130 deployment on Base Sepolia (chain id `84532`). */
export const baseSepoliaDeployment = {
  accountConfiguration: '0xAff8A7A86605D61197C1b98630d93B9d9702afb5',
  accounts: {
    default: '0xD67D6ae50521A0ea9Aa1e174C536F346E87a1903',
    defaultHighRate: '0xED15A3590597120f11F320801291f4d7A38156bD',
    erc4337: '0xc0072312BB152278C0CaEb31d034a051ed4a86b9',
    upgradeable: '0x0c5daDDb66Af134D3FD4e69874F665d78b3a4533',
  },
  authenticators: {
    k1: '0x0000000000000000000000000000000000000001',
    p256: '0x3AE129D846CD1CAf0369b4Caa56c188E18E11B15',
    webAuthn: '0x1CB75BE39Fb950202BF4239010534B86EdA66c31',
    delegate: '0x4C4D27e56087797Feca62262417d57be4e30dD1F',
    alwaysValid: '0x520fBA4840729CB57b3Dc7B40D548AcF354DBA25',
  },
  policies: {
    manager: '0x9736ad211D56164bEBA5Fa486c6dfA77E586a7fE',
    sessionPolicy: '0x1c30e92C01B242a748625330777d8A7B5E51EAAE',
  },
} as const satisfies Eip8130Deployment

/**
 * EIP-8130 deployment for the Base "vibenet" devnet (chain id `84538453`).
 *
 * This devnet runs EIP-8130 **natively**, so the `accountConfiguration` and the
 * native account/authenticator addresses are the ones the execution client
 * enshrines (`base` `Eip8130Contracts`) — *not* the addresses of the example
 * contracts deployed from `base/eip-8130`. Account-address derivation and the
 * native authorization path read this enshrined `accountConfiguration`
 * (`0xb019…`); using any other value derives a different address and the create
 * transaction's sender fails to authorize.
 *
 * The EVM-execution-only contracts the client does not enshrine (`erc4337` and
 * `upgradeable` account implementations, and the example `policies`) are taken
 * from the `base/eip-8130` devnet broadcast; they are only relevant to the
 * ERC-4337 / policy-gated execution path, not native `AA_TX_TYPE` inclusion.
 */
export const vibenetDevnetDeployment = {
  // Enshrined by the execution client (native path) — verified on-devnet.
  accountConfiguration: '0xb0198a714872EE5bfDF829e7986DB5C5899a6b50',
  accounts: {
    default: '0x124b52d5D57a76ed064c414975beA11Beffe0251',
    defaultHighRate: '0x13dD0F222cCF60B7C08a95C2d1FcC85A38DD675D',
    // EVM-execution-only (base/eip-8130 devnet broadcast).
    erc4337: '0xfd054f275750DA23893aECaDE788825f8A3F434C',
    upgradeable: '0x7Cf83aB369Fefabe2C9cb6D7C9DE816cc4f68Eaa',
  },
  authenticators: {
    k1: '0x0000000000000000000000000000000000000001',
    p256: '0x3AE129D846CD1CAf0369b4Caa56c188E18E11B15',
    webAuthn: '0x1CB75BE39Fb950202BF4239010534B86EdA66c31',
    delegate: '0xE67D299Ff3F0a185398B6C5a28998696969265d7',
    alwaysValid: '0x520fBA4840729CB57b3Dc7B40D548AcF354DBA25',
  },
  policies: {
    manager: '0x95540b6dA4EaEf672c767477e84EeEa94E318135',
    sessionPolicy: '0x1577b86A7F621B2274909BeD3D9e7dE2a008151C',
  },
} as const satisfies Eip8130Deployment

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
