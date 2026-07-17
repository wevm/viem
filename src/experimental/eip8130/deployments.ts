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
     * Deployed as a fourth singleton by base's canonical `Deploy.s.sol`
     * (base/eip-8130#27) at the canonical CREATE2 address below.
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
  accountConfiguration: '0xe7Bb8eF3728ea9f0A8be6D7e9585FeAb12dE086A',
  accounts: {
    // `upgradeable` / `erc4337` are unaudited example wallets (base/eip-8130-examples),
    // not part of base/eip-8130's canonical `Deploy.s.sol` set. They cascade off
    // `accountConfiguration`; re-pin once the examples repo publishes a broadcast.
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

/** EIP-8130 deployment on Base Sepolia (chain id `84532`). */
export const baseSepoliaDeployment = canonicalEip8130Deployment

/**
 * EIP-8130 deployment for the Base "vibenet" devnet (chain id `84538453`).
 *
 * The devnet runs EIP-8130 **natively**: the execution client enshrines the
 * canonical `accountConfiguration` (and the account/authenticator CREATE2
 * addresses), so those stay identical to Base Sepolia — using any other
 * `accountConfiguration` derives a different account address and create
 * transactions fail with "create address mismatch".
 *
 * The example `policies` are the exception: they are ordinary (non-enshrined)
 * contracts, redeployed on vibenet at base/eip-8130 **#43** ("Pass PolicyBinding
 * at execute; drop config storage"). They are bound to the enshrined
 * AccountConfiguration above and expose the #43 PolicyManager/SessionPolicy ABI
 * (no `install`; `execute(binding, executionData)`). Base Sepolia still points at
 * the earlier (#41) policy addresses.
 */
export const vibenetDevnetDeployment = {
  ...canonicalEip8130Deployment,
  policies: {
    manager: '0x5cF2a01d34d1B244C63D9F2215E53F9aac06de60',
    sessionPolicy: '0x865D22bA9B452E38c7c4c83a619D3C25e5AC3F18',
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
