import type { Address } from 'abitype'

/**
 * Onchain addresses for an EIP-8130 deployment ([base/eip-8130](https://github.com/base/eip-8130)).
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
  accountConfiguration: '0x53648Cf00356fbAA1F2B531715c6B64AaBDE1555',
  accounts: {
    // `upgradeable` / `erc4337` are unaudited example wallets and are not part
    // of the canonical deployment. Callers must provide those implementations
    // explicitly if they choose an example-specific path.
    default: '0x58da469ef71Dd4B092B010CdA37DE124C926EebD',
    defaultHighRate: '0x23Fe6949d6370330Ae32e7c17E1265D65955C92a',
  },
  authenticators: {
    k1: '0x0000000000000000000000000000000000000001',
    p256: '0xf8847a74F8067CabaE5fe56B70b372A7D670f0f8',
    webAuthn: '0x871c72d3950308A028E9c4917591bcfd3D6a1EF7',
    delegate: '0xbb73E3871FBaC8aef1a7Ee8A24E21139916f14C2',
    alwaysValid: '0xA550545Da91720c23483c5B3493412A02D1cF9F9',
  },
  policies: {
    manager: '0x6e9E627770C1c90371A2E4CB9474A7Af577a4306',
    sessionPolicy: '0x58ef2d572a1bC528f0B9121d686B2618809604Dc',
  },
} as const satisfies Eip8130Deployment

/**
 * Current EIP-8130 deployment on Base Sepolia (chain id `84532`).
 *
 * Base Sepolia has not yet migrated to the latest canonical AccountConfiguration
 * deployment, so keep its live addresses separate until that network upgrades.
 */
export const baseSepoliaDeployment = {
  accountConfiguration: '0xe7Bb8eF3728ea9f0A8be6D7e9585FeAb12dE086A',
  accounts: {
    upgradeable: '0xF8dafa4DA35F664cf2CF842f00482ebb68a982b3',
    default: '0xDd802113C9FF6964cD2A61A16e075D5271cC82c9',
    defaultHighRate: '0xe5edfB7E7365893d685c2FbFBAC3e022f51d942F',
    erc4337: '0x8812ee1c9BA2395b5f113412769f22C6e7b89B11',
  },
  authenticators: {
    k1: '0x0000000000000000000000000000000000000001',
    p256: '0xf8847a74F8067CabaE5fe56B70b372A7D670f0f8',
    webAuthn: '0x871c72d3950308A028E9c4917591bcfd3D6a1EF7',
    delegate: '0x1B0195ba5E3FCdB387DD619816eeF8b510Ed0855',
    alwaysValid: '0xA550545Da91720c23483c5B3493412A02D1cF9F9',
  },
  policies: {
    manager: '0x18B545EfC321644eE2dB9644c8f94f3f3d5e8624',
    sessionPolicy: '0x6Ef50425716c134162C5c289E02162dde75b23Ea',
  },
} as const satisfies Eip8130Deployment

/**
 * EIP-8130 deployment for the Base "vibenet" devnet (chain id `84538453`).
 *
 * The devnet runs EIP-8130 **natively**: the execution client enshrines the
 * canonical `accountConfiguration`. Using any other value derives a different
 * account address and create transactions fail with "create address mismatch".
 * The example policy contracts use the #43 binding-at-execute ABI.
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
