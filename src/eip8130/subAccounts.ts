import type { Address } from 'abitype'
import { BaseError } from '../errors/base.js'
import type { Hex } from '../types/misc.js'
import { hexToBigInt } from '../utils/encoding/fromHex.js'
import { bytesToHex } from '../utils/encoding/toHex.js'
import { type ToAccountReturnType, toAccount } from './accounts/toAccount.js'
import { canonicalAuthenticators, scopeUnrestricted } from './constants.js'
import { canonicalEip8130Deployment } from './deployments.js'
import { key } from './keys.js'
import type { AaAccountChangeCreate, AaActor } from './types/transaction.js'
import { erc1167Bytecode, upgradeableProxyBytecode } from './utils/proxy.js'
import type { Signer } from './utils/signTransaction.js'

/**
 * An ERC-7895 requested owner key for a `type: 'create'` sub-account. `type`
 * selects the EIP-8130 authenticator the key is registered under.
 */
export type SubAccountKey = {
  /** Owner public key: an address (`type: 'address'`) or a P-256 public key. */
  publicKey: Hex
  /** Key scheme. */
  type: 'address' | 'p256' | 'webcrypto-p256' | 'webauthn-p256'
}

/** Maps an ERC-7895 requested key to its EIP-8130 owner actor. */
function toKeyActor(k: SubAccountKey): AaActor {
  switch (k.type) {
    case 'address':
      return key.k1(k.publicKey as Address)
    case 'p256':
    case 'webcrypto-p256':
      return key.p256(k.publicKey)
    case 'webauthn-p256':
      return key.webAuthn(k.publicKey)
    default:
      throw new BaseError(`Unsupported sub-account key type: "${k.type}".`)
  }
}

function randomBytes32(): Hex {
  const buf = new Uint8Array(32)
  globalThis.crypto.getRandomValues(buf)
  return bytesToHex(buf)
}

export type FulfillAddSubAccountParameters = {
  /**
   * The parent account that controls the sub-account. Registered on the
   * sub-account as an unrestricted **delegate** actor (`key.delegate(parent)`),
   * so anyone who can act on the parent can drive the sub-account — a
   * "controlled by" link, without sharing raw keys or reusing key material.
   */
  parent: Address
  /**
   * The parent's controlling signer. Produces the sub-account's `senderAuth`
   * through the delegate authenticator (the signature is validated for `parent`).
   */
  signer: Signer
  /**
   * ERC-7895 requested owner keys (from a `type: 'create'` request) registered
   * as additional unrestricted co-owners of the sub-account.
   */
  keys?: readonly SubAccountKey[] | undefined
  /**
   * CREATE2 uniqueness factor (bytes32). Randomly generated if omitted; pass a
   * stable salt to derive a deterministic sub-account address.
   */
  salt?: Hex | undefined
  /** Per-account proxy. @default 'upgradeable' (see {@link newSmartAccount}). */
  proxy?: 'erc1167' | 'upgradeable' | undefined
  /** Implementation the proxy delegates to. */
  implementation?: Address | undefined
  /** Deployment bytecode override (bypasses `proxy`/`implementation`). */
  code?: Hex | undefined
  /** AccountConfiguration contract override. Defaults to canonical. */
  accountConfigAddress?: Address | undefined
}

export type FulfillAddSubAccountReturnType = ToAccountReturnType & {
  /**
   * The `create` account-change entry — include in the sub-account's first
   * transaction's `accountChanges` to deploy + link it in one shot.
   */
  readonly createChange: AaAccountChangeCreate
  /** The delegate actor linking the sub-account to its `parent`. */
  readonly parentActor: AaActor
  /** ERC-7895 `wallet_addSubAccount` response. */
  readonly response: { address: Address }
}

export type FulfillAddSubAccountErrorType = BaseError

/**
 * Fulfill an ERC-7895 `wallet_addSubAccount` (`type: 'create'`) request as a
 * **distinct** EIP-8130 smart account controlled by the `parent` via a delegate
 * actor.
 *
 * The sub-account is its own address (asset isolation) whose initial owner set
 * is the requested `keys` plus `key.delegate(parent)` — so the parent can co-
 * sign / recover it while the requested keys operate it. The link is installed
 * at creation (in `createChange`), so no separate change transaction is needed.
 *
 * The returned handle signs for the sub-account with the parent's `signer`
 * through the delegate authenticator. Deploy on first use by including
 * `createChange` in the first transaction's `accountChanges`.
 *
 * @example
 * import { fulfillAddSubAccount, sendCalls } from 'viem/eip8130'
 *
 * const sub = fulfillAddSubAccount({
 *   parent: parent.address,
 *   signer: parent.signer, // signs via the delegate authenticator
 *   proxy: 'erc1167',
 *   keys: [{ publicKey: dappKeyAddress, type: 'address' }],
 * })
 *
 * // ERC-7895 response: { address }
 * sub.response.address
 *
 * // deploy + first call in one shot (parent drives it as a delegate)
 * await sendCalls(client, {
 *   account: sub,
 *   accountChanges: [sub.createChange],
 *   calls: [{ to: recipient, value: 1n }],
 *   gas: 300_000n,
 * })
 */
export function fulfillAddSubAccount(
  parameters: FulfillAddSubAccountParameters,
): FulfillAddSubAccountReturnType {
  const {
    parent,
    signer,
    keys = [],
    proxy = 'upgradeable',
    implementation,
    accountConfigAddress,
  } = parameters

  const parentActor = key.delegate(parent)

  // Owner set: the parent delegate + the requested keys, sorted by actorId in
  // strictly ascending order (protocol requirement), rejecting duplicates.
  const initialActors: AaActor[] = [parentActor, ...keys.map(toKeyActor)].sort(
    (a, b) => {
      const ai = hexToBigInt(a.actorId as Hex)
      const bi = hexToBigInt(b.actorId as Hex)
      return ai < bi ? -1 : ai > bi ? 1 : 0
    },
  )
  for (let i = 1; i < initialActors.length; i++)
    if (initialActors[i]!.actorId === initialActors[i - 1]!.actorId)
      throw new BaseError(
        `Duplicate initial actor id \`${initialActors[i]!.actorId}\` (parent delegate and requested keys must be distinct).`,
      )

  const salt = parameters.salt ?? randomBytes32()

  const code =
    parameters.code ??
    (() => {
      if (proxy === 'erc1167')
        return erc1167Bytecode(
          implementation ?? canonicalEip8130Deployment.accounts.default,
        )
      const impl =
        implementation ?? canonicalEip8130Deployment.accounts.upgradeable
      if (!impl)
        throw new BaseError(
          'No canonical `UpgradeableAccount` is enshrined yet (pending final ' +
            'implementation), so `proxy: "upgradeable"` requires an explicit ' +
            '`implementation`. Pass `proxy: "erc1167"` for an immutable ' +
            'DefaultAccount-backed sub-account.',
        )
      return upgradeableProxyBytecode(impl)
    })()

  const inner = toAccount({
    signer,
    userSalt: salt,
    code,
    initialActors,
    // The sub-account is driven by the parent through the delegate authenticator.
    authenticator: canonicalAuthenticators.delegate,
    actorId: parentActor.actorId,
    scope: scopeUnrestricted,
    accountConfigAddress,
  })

  return {
    ...inner,
    createChange: inner.create(),
    parentActor,
    response: { address: inner.address },
  }
}
