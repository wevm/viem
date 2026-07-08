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
  /** Deployed wallet implementation contracts (the singletons account proxies delegate to). */
  accounts: {
    /**
     * UpgradeableAccount implementation — the default for smart accounts.
     * Accounts are deployed behind an ERC-1967 `UpgradeableProxy` (see
     * {@link upgradeableProxyBytecode}) so they can be upgraded via
     * `upgradeBySignature`.
     */
    upgradeable: Address
    /**
     * DefaultAccount implementation — the bare account, deployed standalone as
     * the direct EIP-7702 delegation target for EOAs (no proxy). This is the
     * default `delegate` target when an EOA adopts an EIP-8130 account.
     */
    default: Address
    /**
     * DefaultHighRateAccount implementation — the immutable smart-account
     * variant. Deployed behind a 45-byte ERC-1167 proxy (see
     * {@link erc1167Bytecode}).
     */
    defaultHighRate: Address
    /**
     * BackwardsCompatible4337Account — the ERC-4337 portable implementation
     * (`DefaultAccount` + `validateUserOp`). Lets an account run on non-native
     * chains via a bundler + EntryPoint at the same address; the EntryPoint is
     * registered as a trusted-executor actor (see {@link key.trustedExecutor}).
     * Not deployed by base's canonical `Deploy.s.sol` — deploy it separately;
     * the CREATE2 address below is canonical.
     */
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
 * Canonical EIP-8130 deployment addresses. Every contract is deployed through
 * Nick's deterministic CREATE2 factory with `salt = 0` (see `base/eip-8130`
 * `script/Deploy.s.sol`), so each address is a pure function of its compiled
 * bytecode — identical on every chain (Base Sepolia, vibenet devnet, mainnet
 * when live).
 *
 * `accountConfiguration` is enshrined in the execution client; using any other
 * value derives a different account address and the create transaction fails.
 *
 * When the `base/eip-8130` contracts are recompiled (Solidity upgrade or
 * bytecode change), all addresses must be re-derived and this object updated.
 */
export const canonicalEip8130Deployment = {
  accountConfiguration: '0x2403408177dB7F8512a9593343a7C80371D8f2dF',
  accounts: {
    upgradeable: '0xF8dafa4DA35F664cf2CF842f00482ebb68a982b3',
    default: '0xaF0973bbebe12BDaE6B61c96019dc0DcA554b67c',
    defaultHighRate: '0x6c4230a4101849a3CB6438C40D3d47EdE9aca096',
    erc4337: '0x8812ee1c9BA2395b5f113412769f22C6e7b89B11',
  },
  authenticators: {
    k1: '0x0000000000000000000000000000000000000001',
    p256: '0x28096E6f98996799A08fBbCFF0B7c0D512D1f503',
    webAuthn: '0xD9B8d163a34FBaD781057F7B68889F0bbd70D7ed',
    delegate: '0xb1f064A99919E4199b45F1b553b6ecb8d5d62a11',
    alwaysValid: '0x4299a796C1D3ffCe7885ce13d9815C1b4DB2Ea94',
  },
  policies: {
    manager: '0x5E5c3D54078d1000309233fEc116A83Df5a07E67',
    sessionPolicy: '0xbd26BdA18Ee35F767ef03fD72356ae598ed6f793',
  },
} as const satisfies Eip8130Deployment

/** EIP-8130 deployment on Base Sepolia (chain id `84532`). */
export const baseSepoliaDeployment = canonicalEip8130Deployment

/**
 * EIP-8130 deployment for the Base "vibenet" devnet (chain id `84538453`).
 *
 * The devnet runs EIP-8130 **natively** and the execution client enshrines the
 * canonical CREATE2 addresses (via `Deploy.s.sol`), identical to
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
