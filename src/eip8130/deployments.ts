import type { Address } from 'abitype'

/**
 * Onchain addresses for an EIP-8130 deployment ([base/eip-8130](https://github.com/base/eip-8130)).
 *
 * The keystore itself is enshrined and identical on every chain (see
 * {@link keystoreAddress}); it is not part of this per-chain record. On chains
 * **without** native EIP-8130 support, these contracts provide the portable
 * path: `accounts` are the wallet implementations (proxied via ERC-1167), and
 * `authenticators` are the deployed authenticator contracts used during EVM
 * execution (native chains use the protocol sentinels instead).
 */
export type Eip8130Deployment = {
  /** Deployed wallet implementation contracts (the singletons account proxies delegate to). */
  accounts: {
    /**
     * Optional unaudited UpgradeableAccount example implementation.
     * Accounts are deployed behind an ERC-1967 `UpgradeableProxy` (see
     * {@link upgradeableProxyBytecode}) so they can be upgraded via
     * `upgradeBySignature`.
     */
    upgradeable?: Address | undefined
    /**
     * DefaultAccount implementation — the bare account, deployed standalone as
     * the direct EIP-7702 delegation target for EOAs (no proxy). This is the
     * default `delegate` target when an EOA adopts an EIP-8130 account.
     */
    default: Address
    /**
     * CanonicalHighRatePayerAccount implementation. Deployed behind a 45-byte
     * ERC-1167 proxy (see {@link erc1167Bytecode}).
     */
    defaultHighRate: Address
    /**
     * Optional unaudited BackwardsCompatible4337Account example implementation
     * (`DefaultAccount` + `validateUserOp`). Lets an account run on non-native
     * chains via a bundler + EntryPoint at the same address; the EntryPoint is
     * registered as a trusted-executor actor (see {@link key.trustedExecutor}).
     * This is not deployed by base's canonical `Deploy.s.sol`.
     */
    erc4337?: Address | undefined
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
   * Actor-policy contracts. Policies are app-level, not part of the EIP-8130
   * protocol: a restricted actor is gated to the `manager`, which forwards
   * committed call plans built by the policy. Base ships one audited
   * `PolicyManager` and one `SessionPolicy` in use today; both are extensible —
   * add a new policy under the same manager, or deploy a new manager. See
   * `viem/eip8130` policy helpers.
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
 * Nick's deterministic CREATE2 factory with a **per-contract mined salt** (see
 * `base/eip-8130` `script/Deploy.s.sol`), so each address is a pure function of
 * its compiled bytecode and salt — identical on every chain (Base Sepolia,
 * vibenet devnet, mainnet when live). Each salt is mined so the contract shares
 * the `0x8130…` vanity prefix (except `alwaysValid`, deployed under the zero
 * salt).
 *
 * The keystore is enshrined at {@link keystoreAddress} (not listed here, since it
 * is fixed and not configurable).
 *
 * When the `base/eip-8130` contracts are recompiled (Solidity upgrade or
 * bytecode change), all addresses must be re-derived and this object updated.
 */
export const canonicalEip8130Deployment = {
  accounts: {
    // PENDING FINAL IMPLEMENTATION: the default `newSmartAccount` proxy is
    // `'upgradeable'`, which must delegate to a real UUPS `UpgradeableAccount`
    // (see base/eip-8130-examples) so accounts are genuinely upgradeable and
    // multichain-safe. No such implementation is enshrined against the canonical
    // Keystore yet — its address is keystore-dependent (constructor arg), and
    // the expected long-term implementation is Coinbase Smart Wallet v2. Until an
    // address is set here, `proxy: 'upgradeable'` requires an explicit
    // `implementation`. Set `upgradeable` once deployed and the default goes live.
    upgradeable: undefined,
    default: '0x813035E3fc4a102CE2b4a73D78a25D1Ea5AFadEf',
    defaultHighRate: '0x8130D6819734515f958965eFd2d212541d44FA57',
    // `erc4337` (BackwardsCompatible4337Account) is intentionally out of scope
    // for now — supply it explicitly if you choose the ERC-4337 portable path.
  },
  authenticators: {
    k1: '0x0000000000000000000000000000000000000001',
    p256: '0x8130C89F65750431b564A4730397552a11CeA256',
    webAuthn: '0x813007b6b1b48E75D91dEc5927ab515d12a0F1d0',
    delegate: '0x8130015119757e0b1F9985F723091a851598Ade1',
    alwaysValid: '0xA550545Da91720c23483c5B3493412A02D1cF9F9',
  },
  policies: {
    manager: '0x8130fAA29D2675D05d01D387C576c6525F280ac1',
    sessionPolicy: '0x81306283dfD94FcDe1a3aD4b7beDF1c5cD0f5e55',
  },
} as const satisfies Eip8130Deployment

/**
 * EIP-8130 deployment on Base Sepolia (chain id `84532`).
 *
 * The finalized contracts deploy at deterministic, per-contract-salt addresses
 * that are identical on every chain, so this is just the canonical set.
 */
export const baseSepoliaDeployment = {
  ...canonicalEip8130Deployment,
} as const satisfies Eip8130Deployment

/**
 * EIP-8130 deployment for the Base "vibenet" devnet (chain id `84538453`).
 *
 * The devnet runs EIP-8130 **natively**: the execution client enshrines the
 * keystore at {@link keystoreAddress}. Using any other value derives a different
 * account address and create transactions fail with "create address mismatch".
 */
export const vibenetDevnetDeployment = {
  ...canonicalEip8130Deployment,
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
