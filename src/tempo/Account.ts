import type { Bytes } from 'ox'
import {
  Address,
  Authorization,
  Hash,
  Hex,
  P256,
  PersonalMessage,
  PublicKey,
  Secp256k1,
  Signature,
  TransactionEnvelope as TxEnvelope,
  TypedData,
  WebAuthnP256,
  WebCryptoP256,
} from 'ox'
import {
  AccountConfig,
  Channel,
  KeyAuthorization,
  SignatureEnvelope,
  TxEnvelopeTempo,
} from 'ox/tempo'

import { parseApproval } from './accounts/Signature.js'

import * as viem_Account from '../core/Account.js'
import * as Errors from '../core/Errors.js'
import type { OneOf, RequiredBy } from '../core/internal/types.js'
import {
  chainConfig,
  type Envelope,
  type SerializeOptions,
} from './chainConfig.js'
import type * as KeyAuthorizationManager from './KeyAuthorizationManager.js'

/** Base shape shared by Tempo accounts. */
export type Base<source extends string = string> = RequiredBy<
  viem_Account.Local<SignatureEnvelope.Type>,
  'publicKey' | 'signAuthorization'
> & {
  /**
   * Signs a hash.
   *
   * Access key accounts sign through a keychain envelope by default (so the
   * signature authorizes the parent account). Set `raw` to `true` to sign
   * directly with the key, without keychain hashing or enveloping.
   */
  sign: (parameters: {
    /** Hash to sign. */
    hash: Hex.Hex
    /** Sign directly with the key, without keychain hashing or enveloping. */
    raw?: boolean | undefined
  }) => Promise<Hex.Hex>
  /** Signs a payment-channel voucher (TIP-1054). */
  signVoucher: (
    parameters: signVoucher.Parameters,
  ) => Promise<signVoucher.ReturnValue>
  /** Account source. */
  source: source
}

/** A root Tempo account (signs for its own address). */
export type RootAccount = Base<'root'> & {
  /** Signs a key authorization for an access key (TIP-1044). */
  signKeyAuthorization: (
    key: resolveAccessKey.Parameters,
    parameters: Omit<signKeyAuthorization.Parameters, 'key'>,
  ) => Promise<KeyAuthorization.Signed>
}

/** An access key Tempo account (signs on behalf of a parent account). */
export type AccessKeyAccount = Omit<Base<'accessKey'>, 'keyType'> & {
  /** Access key address: the address of the key, or of the configurable account acting as the key. */
  accessKeyAddress: Address.Address
  /** Configurable account (TIP-1111) that signs as the access key, when the access key is one. */
  delegate?: ConfigurableAccount | undefined
  /** Key type. `configurable` for a configurable account acting as the access key. */
  keyType: KeyAuthorization.KeyAuthorization['type']
  /** Pending key authorization manager. */
  keyAuthorizationManager?:
    | KeyAuthorizationManager.KeyAuthorizationManager
    | undefined
}

/** A Tempo account. */
export type Account = OneOf<
  RootAccount | AccessKeyAccount | ConfigurableAccount
>

/**
 * Rebuilds a configurable account (TIP-1107) from the value of {@link serialize},
 * such as one read from storage, without a request.
 *
 * Passkeys among `credentials` sign as owners when their public key derives an
 * owner's address; others are ignored. A version-zero config must derive
 * `address`, and a later version keeps `address`.
 *
 * @example
 * ```ts
 * import { Account } from 'viem/tempo'
 *
 * const account = Account.deserialize(
 *   JSON.parse(localStorage.getItem('account')!),
 *   { credentials: [credential] },
 * )
 * ```
 *
 * @param value Serialized account.
 * @param options Options.
 * @returns Configurable account.
 */
export function deserialize(
  value: Serialized,
  options: deserialize.Options = {},
): ConfigurableAccount {
  const { address, config } = value
  const { credentials = [], getFn } = options
  if (!config) return fromConfig(address)

  const owners = config.owners.map(({ owner, weight }) => {
    const credential = credentials.find((credential) =>
      Address.isEqual(
        Address.fromPublicKey(PublicKey.fromHex(credential.publicKey)),
        owner,
      ),
    )
    if (!credential) return { owner, weight }
    const { rpId } = credential
    return { owner: fromWebAuthnP256(credential, { getFn, rpId }), weight }
  })
  const { salt, threshold } = config
  const version = BigInt(config.version)
  const account =
    version === 0n
      ? fromConfig({ owners, salt, threshold })
      : fromConfig({ address, owners, salt, threshold, version })
  if (!Address.isEqual(account.address, address))
    throw new AddressMismatchError({ address, derived: account.address })
  return account
}

export declare namespace deserialize {
  type Credential = fromWebAuthnP256.Credential & {
    /** Relying party ID of the passkey, such as `example.com`. */
    rpId?: string | undefined
  }

  type Options = {
    /** Passkeys that may hold owner keys of the account. */
    credentials?: readonly Credential[] | undefined
    /** Runs a passkey owner's ceremony in place of `navigator.credentials.get`. */
    getFn?: fromWebAuthnP256.Options['getFn'] | undefined
  }

  type ErrorType = AddressMismatchError | Error
}

/**
 * Instantiates an Account from a sign function and public key.
 *
 * Pass `access` to instantiate an access key account that signs on behalf of
 * the parent account through a keychain envelope.
 *
 * @example
 * ```ts
 * import { Account } from 'viem/tempo'
 *
 * const account = Account.from({
 *   keyType: 'secp256k1',
 *   publicKey,
 *   async sign({ hash }) { … },
 * })
 * ```
 */
export function from<const parameters extends from.Parameters>(
  parameters: parameters | from.Parameters,
): from.ReturnValue<parameters> {
  // Widen to the concrete union so the `access` check narrows each arm.
  const params: from.Parameters = parameters
  const account = params.access ? fromAccessKey(params) : fromRoot(params)
  return account as from.ReturnValue<parameters>
}

export declare namespace from {
  type Parameters = OneOf<fromRoot.Parameters | fromAccessKey.Parameters>

  type ReturnValue<
    parameters extends {
      access?: fromAccessKey.Parameters['access'] | undefined
    } = {
      access?: fromAccessKey.Parameters['access'] | undefined
    },
  > = parameters extends {
    access: fromAccessKey.Parameters['access']
  }
    ? AccessKeyAccount
    : RootAccount
}

/**
 * Instantiates an Account from a headless WebAuthn credential (P256 private key).
 *
 * @example
 * ```ts
 * import { Account } from 'viem/tempo'
 *
 * const account = Account.fromHeadlessWebAuthn('0x…', {
 *   rpId: 'example.com',
 *   origin: 'https://example.com',
 * })
 * ```
 *
 * @param privateKey P256 private key.
 * @returns Account.
 */
export function fromHeadlessWebAuthn<
  const options extends fromHeadlessWebAuthn.Options,
>(
  privateKey: Hex.Hex,
  options: options | fromHeadlessWebAuthn.Options,
): fromHeadlessWebAuthn.ReturnValue<options> {
  const { access, keyAuthorization, keyAuthorizationManager, rpId, origin } =
    options

  const publicKey = P256.getPublicKey({ privateKey })

  return from({
    ...(access ? { access, keyAuthorization, keyAuthorizationManager } : {}),
    keyType: 'webAuthn',
    publicKey,
    async sign({ hash }) {
      const { metadata, payload } = WebAuthnP256.getSignPayload({
        ...options,
        challenge: hash,
        rpId,
        origin,
      })
      const signature = P256.sign({
        payload,
        privateKey,
        hash: true,
      })
      return SignatureEnvelope.serialize({
        metadata,
        signature,
        publicKey,
        type: 'webAuthn',
      })
    },
  }) as fromHeadlessWebAuthn.ReturnValue<options>
}

export declare namespace fromHeadlessWebAuthn {
  type Options = Omit<
    WebAuthnP256.getSignPayload.Options,
    'challenge' | 'rpId' | 'origin'
  > &
    Pick<
      from.Parameters,
      'access' | 'keyAuthorization' | 'keyAuthorizationManager'
    > & {
      /** Relying Party ID. */
      rpId: string
      /** Origin. */
      origin: string
    }

  type ReturnValue<options extends Options = Options> =
    from.ReturnValue<options>
}

/**
 * Instantiates an Account from a P256 private key.
 *
 * @example
 * ```ts
 * import { Account } from 'viem/tempo'
 *
 * const account = Account.fromP256('0x…')
 * ```
 *
 * @param privateKey P256 private key.
 * @returns Account.
 */
export function fromP256<const options extends fromP256.Options>(
  privateKey: Hex.Hex,
  options: options | fromP256.Options = {},
): fromP256.ReturnValue<options> {
  const { access, keyAuthorization, keyAuthorizationManager } = options
  const publicKey = P256.getPublicKey({ privateKey })

  return from({
    ...(access ? { access, keyAuthorization, keyAuthorizationManager } : {}),
    keyType: 'p256',
    publicKey,
    async sign({ hash }) {
      const signature = P256.sign({ payload: hash, privateKey })
      return SignatureEnvelope.serialize({
        signature,
        publicKey,
        type: 'p256',
      })
    },
  }) as fromP256.ReturnValue<options>
}

export declare namespace fromP256 {
  type Options = Pick<
    from.Parameters,
    'access' | 'keyAuthorization' | 'keyAuthorizationManager'
  >

  type ReturnValue<options extends Options = Options> =
    from.ReturnValue<options>
}

/**
 * Instantiates an Account from a Secp256k1 private key.
 *
 * @example
 * ```ts
 * import { Account } from 'viem/tempo'
 *
 * const account = Account.fromSecp256k1('0x…')
 * ```
 *
 * @param privateKey Secp256k1 private key.
 * @returns Account.
 */
export function fromSecp256k1<const options extends fromSecp256k1.Options>(
  privateKey: Hex.Hex,
  options: options | fromSecp256k1.Options = {},
): fromSecp256k1.ReturnValue<options> {
  const { access, keyAuthorization, keyAuthorizationManager } = options
  const publicKey = Secp256k1.getPublicKey({ privateKey })

  return from({
    ...(access ? { access, keyAuthorization, keyAuthorizationManager } : {}),
    keyType: 'secp256k1',
    publicKey,
    async sign(parameters) {
      const { hash } = parameters
      const signature = Secp256k1.sign({ payload: hash, privateKey })
      return Signature.toHex(signature)
    },
  }) as fromSecp256k1.ReturnValue<options>
}

export declare namespace fromSecp256k1 {
  type Options = Pick<
    from.Parameters,
    'access' | 'keyAuthorization' | 'keyAuthorizationManager'
  >

  type ReturnValue<options extends Options = Options> =
    from.ReturnValue<options>
}

/**
 * Instantiates an Account for a configurable account (TIP-1107) config.
 *
 * The returned account does not hold a key itself. Omit `address` or set it to
 * `infer` to derive an account address from its initial config. For a current
 * config, set `address` to the stable account address. For an account
 * upgraded in place with `Actions.accounts.upgrade`, set `address` to the
 * upgraded account and pass the installed owners and threshold as `upgrade`.
 * Pass the address directly for an address-only account.
 *
 * Owners can be accounts or addresses directly, or weighted `{ owner, weight }`
 * entries. Direct owners default to weight `1`, and `threshold` defaults to `1`.
 * Local owner accounts are retained for signing, using primitive signatures.
 * Configs containing only owner addresses require external approvals through
 * `signatures`.
 *
 * Normalizes supplied config fields with `AccountConfig.from`, so callers do
 * not need to normalize owner ordering themselves.
 *
 * `sign`, `signMessage`, and `signTypedData` return a configurable signature
 * envelope with local owner approvals up to the config threshold. Signatures
 * verify against the account's current config, so a config update invalidates
 * earlier signatures. Verify them with `verifyHash`, `verifyMessage`, or
 * `verifyTypedData` on a Tempo client, which use the signature verifier
 * precompile. A registered account (after its first transaction or an upgrade)
 * carries the account code marker and answers ERC-1271 `isValidSignature` and
 * `onERC721Received` through a shim. A counterfactual account has no code, so
 * ERC-1271 verifiers do not accept its signatures until it is registered.
 *
 * A derived account's address is the last 20 bytes of a keccak256 hash of its
 * version-zero config (TIP-1107), so it stays fixed across config updates. An
 * upgraded account keeps its existing address.
 *
 * Tempo stores a commitment to the current config, not its fields. Retain the
 * current config, or recover it from the account's
 * `ConfigurableAccountConfigUpdated` events (registration emits version `0`),
 * starting from `AccountUpgraded` for an upgraded account.
 *
 * Pass `access` to sign as an access key of another account (TIP-1111). The
 * parent authorizes the account's address with key type `configurable`, and the
 * returned access key account signs as the parent: a keychain envelope wraps
 * the owner quorum over `keccak256(0x04 || hash || parent)`. Requires the T14
 * hardfork.
 *
 * @example
 * ```ts
 * import { Account } from 'viem/tempo'
 *
 * const account = Account.fromConfig({
 *   address: 'infer',
 *   owners: [owner_1, owner_2],
 *   threshold: 2,
 * })
 *
 * // The account config is inferred from the account.
 * const { request } = await client.transaction.prepare({ account, ...rest })
 *
 * const transaction = await client.transaction.sign(request)
 * ```
 *
 * @example
 * ### Access Key
 *
 * ```ts
 * import { Account } from 'viem/tempo'
 *
 * const accessKey = Account.fromConfig(
 *   { owners: [owner_1, owner_2], threshold: 2 },
 *   { access: treasury },
 * )
 *
 * await client.accessKey.authorizeSync({ account: treasury, accessKey })
 *
 * await client.transaction.sendSync({ account: accessKey, calls })
 * ```
 *
 * @param value Initial config, current config, upgrade config, or account address.
 * @param options Options.
 * @returns Configurable account, or an access key account when `access` is set.
 */
export function fromConfig<const options extends fromConfig.Options = {}>(
  value: fromConfig.InitialConfig,
  options?: options | fromConfig.Options,
): fromConfig.ReturnValue<options, AccountConfig.Config>
export function fromConfig<const options extends fromConfig.Options = {}>(
  value: fromConfig.CurrentConfig,
  options?: options | fromConfig.Options,
): fromConfig.ReturnValue<options, AccountConfig.Config>
export function fromConfig<const options extends fromConfig.Options = {}>(
  value: fromConfig.UpgradeConfig,
  options?: options | fromConfig.Options,
): fromConfig.ReturnValue<options, AccountConfig.Config>
export function fromConfig<const options extends fromConfig.Options = {}>(
  address: Address.Address,
  options?: options | fromConfig.Options,
): fromConfig.ReturnValue<options, undefined>
export function fromConfig<const options extends fromConfig.Options = {}>(
  value: fromConfig.Parameters,
  options?: options | fromConfig.Options,
): fromConfig.ReturnValue<options>
export function fromConfig(
  value: fromConfig.Parameters,
  options: fromConfig.Options = {},
): ConfigurableAccount | AccessKeyAccount {
  const configInput = (() => {
    if (typeof value === 'string') return undefined
    if ('upgrade' in value) return value.upgrade
    const { address: _, ...config } = value
    return config
  })()
  const config = (() => {
    if (!configInput) return undefined
    const ownerEntries = configInput.owners.map((value) =>
      typeof value === 'string' || 'address' in value
        ? { owner: value, weight: 1 }
        : value,
    )
    const owners = ownerEntries.map(({ owner, weight }) => ({
      owner: typeof owner === 'string' ? owner : owner.address,
      weight,
    }))
    const threshold = configInput.threshold ?? 1
    if (typeof value !== 'string' && 'upgrade' in value)
      return AccountConfig.fromUpgrade(value.address, { owners, threshold })
    return AccountConfig.from({ ...configInput, owners, threshold })
  })()
  if (typeof value !== 'string' && !('upgrade' in value)) {
    if (
      (value.address === undefined || value.address === 'infer') &&
      config!.version !== 0n
    )
      throw new Error('An initial account config must have version zero.')
    if (
      value.address !== undefined &&
      value.address !== 'infer' &&
      config!.version === 0n
    )
      throw new Error('A current account config must have a version.')
  }
  const address = Address.checksum(
    (() => {
      if (typeof value === 'string') return value
      if (value.address === undefined || value.address === 'infer')
        return AccountConfig.getAddress(config!)
      return value.address
    })(),
  )
  const ownerAccounts: viem_Account.Local[] = (() => {
    if (!configInput) return []
    return configInput.owners.flatMap((value) => {
      const owner =
        typeof value === 'string' || 'address' in value ? value : value.owner
      return typeof owner === 'string' ? [] : [viem_Account.from(owner)]
    })
  })()
  if (
    ownerAccounts.some(
      (owner) => isConfigurableAccount(owner) || isAccessKeyAccount(owner),
    )
  )
    throw new Error(
      'Configurable account owners must use primitive signatures.',
    )
  const owners =
    config?.owners.flatMap(({ owner }) => {
      const account = ownerAccounts.find((account) =>
        Address.isEqual(account.address, owner),
      )
      return account ? [account] : []
    }) ?? []

  const account: ConfigurableAccount = {
    address,
    config,
    owners,
    publicKey: '0x',
    source: 'configurable',
    keyType: 'configurable',
    type: 'local',
    async sign({ hash }) {
      return SignatureEnvelope.serialize(
        await signConfigurable(account, { payload: hash }),
      )
    },
    async signMessage({ message }) {
      return await account.sign({
        hash: PersonalMessage.getSignPayload(toPayload(message)),
      })
    },
    async signTransaction(envelope_, options) {
      const request = envelope_ as unknown as Envelope
      const serializeTransaction = (
        envelope: Envelope,
        serializeOptions?: Pick<SerializeOptions, 'signature'>,
      ) =>
        serializeEnvelope(envelope, {
          chain: options?.chain,
          sender: address,
          signature: serializeOptions?.signature,
        })
      if (request.owner) {
        const owner = request.owner
        if (owner.type !== 'local')
          throw new Error(
            'A local owner account is required to approve a configurable account transaction.',
          )
        if (owner.source !== 'root')
          throw new Error(
            'A Tempo owner account is required to approve a configurable account transaction.',
          )
        const { owner: _, ...ownerRequest } = request
        const approval = await owner.signTransaction(
          ownerRequest as unknown as TxEnvelope.TxEnvelope<false>,
          options,
        )
        return serializeTransaction({
          ...request,
          signatures: [
            ...(request.signatures ?? []),
            approval as SignatureEnvelope.Serialized,
          ],
        })
      }
      if (owners.length === 0) return serializeTransaction(request)
      // A sponsored request signs the sponsored payload (excluding
      // `feeToken`), which the `feePayerSignature: null` marker selects.
      const payload = TxEnvelopeTempo.getSignPayload(
        request.feePayer && typeof request.feePayerSignature === 'undefined'
          ? { ...request, feePayerSignature: null }
          : request,
      )
      const simulation = request.accountSimulation
      if (request.from && !Address.isEqual(request.from, address))
        throw new Error(
          'Configurable account does not match the transaction sender.',
        )

      const signature = await signConfigurable(account, {
        config: simulation?.config,
        payload,
        signatures: request.signatures?.map((signature) =>
          parseApproval(signature),
        ),
      })
      return serializeTransaction(request, { signature })
    },
    async signTypedData(typedData) {
      return await account.sign({
        hash: TypedData.getSignPayload(typedData as TypedData.encode.Value),
      })
    },
  }
  if (options.access)
    return toAccessKey(account, { ...options, access: options.access })
  return account
}

export declare namespace fromConfig {
  /** Initial version-zero account config. */
  export type Config = InitialConfig

  /** Stable configurable account address and its current config. */
  export type CurrentConfig = {
    /** Stable configurable account address. */
    address: Address.Address
    /** Weighted owners. */
    owners: readonly Owner[]
    /** Caller-chosen 32-byte salt. */
    salt: AccountConfig.Config['salt']
    /** Minimum total owner weight required for authorization. */
    threshold: AccountConfig.Config['threshold']
    /** Current configuration version. */
    version: AccountConfig.Config<bigint | number>['version']
  }

  /** Initial version-zero account config. */
  export type InitialConfig = {
    /** Derives the stable account address from this initial config. */
    address?: 'infer' | undefined
    /** Weighted owners. */
    owners: readonly Owner[]
    /** Caller-chosen 32-byte salt. */
    salt?: AccountConfig.Input['salt'] | undefined
    /** Minimum owner weight required for authorization. */
    threshold?: number | undefined
    /** Initial configuration version. */
    version?: 0 | 0n | undefined
  }

  /** Options for {@link fromConfig}. */
  export type Options = {
    /** Parent account whose access key the configurable account is (TIP-1111). */
    access?: viem_Account.Account | Address.Address | undefined
    /**
     * Signed key authorization of the configurable account, which the access key
     * attaches to its transactions until the chain registers it. Requires
     * `access`, and is ignored when `keyAuthorizationManager` is set.
     */
    keyAuthorization?: KeyAuthorization.Signed | undefined
    /** Pending key authorization manager. Requires `access`. */
    keyAuthorizationManager?:
      | KeyAuthorizationManager.KeyAuthorizationManager
      | undefined
  }

  /** Configurable account owner account or address, optionally with an explicit weight. */
  export type Owner =
    | Address.Address
    | (viem_Account.Local & { accessKeyAddress?: never; owners?: never })
    | (Omit<AccountConfig.Owner, 'owner'> & {
        owner:
          | Address.Address
          | (viem_Account.Local & { accessKeyAddress?: never; owners?: never })
      })

  /** Parameters for {@link fromConfig}. */
  export type Parameters =
    | Address.Address
    | CurrentConfig
    | InitialConfig
    | UpgradeConfig

  /** Access key account when `access` is set, otherwise a configurable account. */
  export type ReturnValue<
    options extends Options = Options,
    config extends AccountConfig.Config | undefined =
      | AccountConfig.Config
      | undefined,
  > = options extends { access: viem_Account.Account | Address.Address }
    ? AccessKeyAccount
    : ConfigurableAccount<config>

  /** Account upgraded in place and the owners and threshold it installed. */
  export type UpgradeConfig = {
    /** Upgraded account address. */
    address: Address.Address
    /** Owners and threshold installed by the upgrade. */
    upgrade: {
      /** Weighted owners. */
      owners: readonly Owner[]
      /** Minimum owner weight required for authorization. */
      threshold?: number | undefined
    }
  }
}

/**
 * Configurable account (TIP-1107) returned by {@link fromConfig}.
 *
 * Its signatures verify against the account's current config through Tempo's
 * `verifyHash`, and a config update invalidates earlier signatures. A registered
 * account also answers ERC-1271 `isValidSignature`; a counterfactual account
 * has no code, so only `verifyHash` verifies its signatures.
 */
export type ConfigurableAccount<
  config extends AccountConfig.Config | undefined =
    | AccountConfig.Config
    | undefined,
> = viem_Account.Local<'configurable'> & {
  /** Account source. */
  source: 'configurable'
  /** Normalized config, or `undefined` for an address-only account. */
  config: config
  /** @internal Local owner accounts available for signing. */
  owners: readonly (viem_Account.Local & { source?: string | undefined })[]
}

/** Wraps a configurable account as an access key of a parent account (TIP-1111). */
function toAccessKey(
  account: ConfigurableAccount,
  options: toAccessKey.Options,
): AccessKeyAccount {
  const { access, keyAuthorization } = options
  const parentAddress = Address.checksum(
    typeof access === 'string' ? access : access.address,
  )
  const accessKeyAddress = account.address
  if (Address.isEqual(parentAddress, accessKeyAddress))
    throw new Error('A configurable account cannot be its own access key.')
  if (
    keyAuthorization &&
    (keyAuthorization.type !== 'configurable' ||
      !Address.isEqual(keyAuthorization.address, accessKeyAddress))
  )
    throw new Error('Key authorization does not authorize this access key.')
  const keyAuthorizationManager =
    options.keyAuthorizationManager ??
    (keyAuthorization ? pending(keyAuthorization) : undefined)

  async function sign(parameters: {
    hash: Hex.Hex
    raw?: boolean | undefined
  }): Promise<Hex.Hex> {
    const { hash, raw } = parameters
    if (raw) return await account.sign({ hash })
    const inner = await signConfigurable(account, {
      payload: Hash.keccak256(Hex.concat('0x04', hash, parentAddress)),
    })
    return SignatureEnvelope.serialize(
      SignatureEnvelope.from({
        inner,
        type: 'keychain',
        userAddress: parentAddress,
        version: 'v2',
      }),
    )
  }

  return {
    accessKeyAddress,
    address: parentAddress,
    delegate: account,
    keyAuthorizationManager,
    keyType: 'configurable',
    publicKey: '0x',
    sign,
    async signAuthorization() {
      throw new Error('A configurable access key cannot sign authorizations.')
    },
    async signMessage({ message }) {
      return await sign({
        hash: PersonalMessage.getSignPayload(toPayload(message)),
      })
    },
    async signTransaction(envelope_, options) {
      const request = envelope_ as unknown as Envelope
      // Owners approve with `signatures` instead (see `accountSimulation`).
      if (request.owner)
        throw new Error(
          'A configurable account is required when an owner is provided.',
        )
      if (request.from && !Address.isEqual(request.from, parentAddress))
        throw new Error(
          'Access key account does not match the transaction sender.',
        )
      const serializeOptions = { chain: options?.chain, sender: parentAddress }
      if (account.owners.length === 0)
        return serializeEnvelope(request, serializeOptions)
      // A sponsored request signs the sponsored payload (excluding
      // `feeToken`), which the `feePayerSignature: null` marker selects.
      const payload = TxEnvelopeTempo.getSignPayload(
        request.feePayer && typeof request.feePayerSignature === 'undefined'
          ? { ...request, feePayerSignature: null }
          : request,
        { from: parentAddress },
      )
      const inner = await signConfigurable(account, {
        config: request.accountSimulation?.config,
        payload,
        signatures: request.signatures?.map((signature) =>
          parseApproval(signature),
        ),
      })
      return serializeEnvelope(request, {
        ...serializeOptions,
        signature: SignatureEnvelope.from({
          inner,
          type: 'keychain',
          userAddress: parentAddress,
          version: 'v2',
        }),
      })
    },
    async signTypedData(typedData) {
      return await sign({
        hash: TypedData.getSignPayload(typedData as TypedData.encode.Value),
      })
    },
    async signVoucher(parameters) {
      return await sign({ hash: getVoucherSignPayload(parameters), raw: true })
    },
    source: 'accessKey',
    type: 'local',
  }
}

declare namespace toAccessKey {
  type Options = fromConfig.Options & {
    access: viem_Account.Account | Address.Address
  }
}

/**
 * Serializes a Tempo envelope through the chain's `serialize` hook, and
 * co-signs it with a local fee payer account.
 */
async function serializeEnvelope(
  envelope: Envelope,
  options: {
    chain?: viem_Account.Local.SignTransactionOptions['chain'] | undefined
    sender: Address.Address
    signature?: SerializeOptions['signature'] | undefined
  },
): Promise<Hex.Hex> {
  const { chain, sender, signature } = options
  const serialize = chain?.transaction?.serialize as
    | ((envelope: Envelope, options?: SerializeOptions) => Hex.Hex | undefined)
    | undefined
  const serializeOptions = signature ? { signature } : undefined
  const serialized =
    serialize?.(envelope, serializeOptions) ??
    chainConfig.transaction.serialize(envelope, serializeOptions)!
  if (
    typeof envelope.feePayer === 'object' &&
    serialized.startsWith(TxEnvelopeTempo.feePayerMagic)
  )
    return signFeePayer(serialized, envelope.feePayer, envelope.from ?? sender)
  return serialized
}

function isConfigurableAccount(
  account: viem_Account.Local,
): account is ConfigurableAccount {
  return 'source' in account && account.source === 'configurable'
}

async function signConfigurable(
  account: ConfigurableAccount,
  parameters: {
    config?: AccountConfig.Config | undefined
    payload: Hex.Hex
    signatures?: readonly SignatureEnvelope.Primitive[] | undefined
  },
): Promise<SignatureEnvelope.Configurable> {
  const { config, payload, signatures: providedSignatures = [] } = parameters
  const currentConfig = config ?? account.config
  if (!currentConfig)
    throw new Error('A current account config is required for local signing.')
  const digest = AccountConfig.getSignPayload({
    account: account.address,
    config: currentConfig,
    payload,
  })
  const signatures = [...providedSignatures]
  const signedOwners = new Set<Address.Address>()
  let weight = 0

  for (const signature of providedSignatures) {
    const address = SignatureEnvelope.extractAddress({
      payload: digest,
      signature,
    }).toLowerCase() as Address.Address
    const owner = currentConfig.owners.find((owner) =>
      Address.isEqual(owner.owner, address),
    )
    if (!owner || signedOwners.has(address)) continue
    signedOwners.add(address)
    weight += Number(owner.weight)
  }

  const owners = [...currentConfig.owners].sort(
    (a, b) =>
      Number(b.weight) - Number(a.weight) ||
      a.owner.toLowerCase().localeCompare(b.owner.toLowerCase()),
  )
  for (const owner of owners) {
    if (weight >= Number(currentConfig.threshold)) break
    const address = owner.owner.toLowerCase() as Address.Address
    if (signedOwners.has(address)) continue
    const ownerAccount = account.owners.find((account) =>
      Address.isEqual(account.address, owner.owner),
    )
    if (!ownerAccount) continue

    if (!ownerAccount.sign)
      throw new Error('Configurable account owner account cannot sign.')
    signatures.push(parseApproval(await ownerAccount.sign({ hash: digest })))

    signedOwners.add(address)
    weight += Number(owner.weight)
    if (weight >= Number(currentConfig.threshold)) break
  }

  if (weight < Number(currentConfig.threshold))
    throw new Error('Local owners do not meet the threshold.')

  return SignatureEnvelope.from({
    account: account.address,
    config: currentConfig,
    signatures: SignatureEnvelope.sortApprovals({
      account: account.address,
      config: currentConfig,
      payload,
      signatures,
    }),
  }) as SignatureEnvelope.Configurable
}

/**
 * Instantiates an Account from a WebAuthn credential.
 *
 * @example
 * ```ts
 * import { Account, WebAuthnP256 } from 'viem/tempo'
 *
 * const credential = await WebAuthnP256.createCredential({ label: 'Example' })
 * const account = Account.fromWebAuthnP256(credential)
 * ```
 *
 * @param credential WebAuthnP256 credential.
 * @returns Account.
 */
export function fromWebAuthnP256(
  credential: fromWebAuthnP256.Credential,
  options: fromWebAuthnP256.Options = {},
): fromWebAuthnP256.ReturnValue {
  const { id } = credential
  const publicKey = PublicKey.fromHex(credential.publicKey)
  return from({
    keyType: 'webAuthn',
    publicKey,
    async sign({ hash }) {
      const { metadata, signature } = await WebAuthnP256.sign({
        ...options,
        challenge: hash,
        credentialId: id,
      })
      return SignatureEnvelope.serialize({
        publicKey,
        metadata,
        signature,
        type: 'webAuthn',
      })
    },
  })
}

export declare namespace fromWebAuthnP256 {
  type Credential = {
    id: WebAuthnP256.P256Credential['id']
    publicKey: Hex.Hex
  }

  type Options = {
    /** Credential request function. */
    getFn?: WebAuthnP256.sign.Options['getFn'] | undefined
    /** Relying Party ID. */
    rpId?: WebAuthnP256.sign.Options['rpId'] | undefined
  }

  type ReturnValue = from.ReturnValue
}

/**
 * Instantiates an Account from a WebCrypto P256 key pair.
 *
 * @example
 * ```ts
 * import { Account, WebCryptoP256 } from 'viem/tempo'
 *
 * const keyPair = await WebCryptoP256.createKeyPair()
 * const account = Account.fromWebCryptoP256(keyPair)
 * ```
 *
 * @param keyPair WebCryptoP256 key pair.
 * @returns Account.
 */
export function fromWebCryptoP256<
  const options extends fromWebCryptoP256.Options,
>(
  keyPair: Awaited<ReturnType<typeof WebCryptoP256.createKeyPair>>,
  options: options | fromWebCryptoP256.Options = {},
): fromWebCryptoP256.ReturnValue<options> {
  const { access, keyAuthorization, keyAuthorizationManager } = options
  const { publicKey, privateKey } = keyPair

  return from({
    ...(access ? { access, keyAuthorization, keyAuthorizationManager } : {}),
    keyType: 'p256',
    publicKey,
    async sign({ hash }) {
      const signature = await WebCryptoP256.sign({ payload: hash, privateKey })
      return SignatureEnvelope.serialize({
        signature,
        prehash: true,
        publicKey,
        type: 'p256',
      })
    },
  }) as fromWebCryptoP256.ReturnValue<options>
}

export declare namespace fromWebCryptoP256 {
  type Options = Pick<
    from.Parameters,
    'access' | 'keyAuthorization' | 'keyAuthorizationManager'
  >

  type ReturnValue<options extends Options = Options> =
    from.ReturnValue<options>
}

/**
 * Signs a payment-channel voucher (TIP-1054).
 *
 * Access key accounts sign the voucher payload directly (without keychain
 * enveloping).
 *
 * @example
 * ```ts
 * import { Account } from 'viem/tempo'
 *
 * const signature = await Account.signVoucher(account, {
 *   chainId: 1337,
 *   channel: channelId,
 *   cumulativeAmount: 100n,
 * })
 * ```
 */
export async function signVoucher(
  account: viem_Account.Local,
  parameters: signVoucher.Parameters,
): Promise<signVoucher.ReturnValue> {
  const hash = getVoucherSignPayload(parameters)
  if (isAccessKeyAccount(account)) return account.sign({ hash, raw: true })
  return await account.sign({ hash })
}

function getVoucherSignPayload(parameters: signVoucher.Parameters) {
  const { chainId, channel, cumulativeAmount } = parameters
  const channelId =
    typeof channel === 'string'
      ? channel
      : Channel.computeId(channel, {
          chainId,
        })

  return Channel.getVoucherSignPayload({
    chainId,
    channelId,
    cumulativeAmount,
  })
}

export declare namespace signVoucher {
  type Parameters = {
    /** Chain ID. */
    chainId: number | bigint
    /** Channel descriptor or ID. */
    channel: Channel.computeId.Channel | Hex.Hex
    /** Total voucher amount signed for the channel. */
    cumulativeAmount: bigint
  }

  type ReturnValue = Hex.Hex
}

function isAccessKeyAccount(
  account: viem_Account.Local,
): account is AccessKeyAccount {
  return (
    (account as AccessKeyAccount).source === 'accessKey' &&
    'accessKeyAddress' in account
  )
}

/**
 * Key-authorization fields as built here: `account` is optional (ox's type
 * pairs it with deprecated admin fields) and `chainId` stays numberish.
 * @internal
 */
type KeyAuthorizationInput = {
  account?: Address.Address | undefined
  address: Address.Address
  chainId: number | bigint
  expiry?: number | null | undefined
  limits?: readonly KeyAuthorization.TokenLimit[] | undefined
  scopes?: readonly KeyAuthorization.Scope[] | undefined
  signature?: SignatureEnvelope.SignatureEnvelope | undefined
  type: KeyAuthorization.KeyAuthorization['type']
  witness?: Hex.Hex | undefined
}

/**
 * Returns the payload an account signs to authorize an access key (TIP-1044).
 *
 * A configurable account binds the authorization to itself. Access keys cannot
 * sign key authorizations.
 *
 * @example
 * ```ts
 * import { Account } from 'viem/tempo'
 *
 * const payload = Account.getKeyAuthorizationSignPayload(account, {
 *   chainId: 1337,
 *   key: accessKey,
 * })
 * ```
 */
export function getKeyAuthorizationSignPayload(
  account: viem_Account.Local,
  parameters: signKeyAuthorization.Parameters,
): Hex.Hex {
  const { chainId, expiry, key, limits, scopes, witness } = parameters
  const { accessKeyAddress, keyType: type } = resolveAccessKey(key)
  if (isAccessKeyAccount(account))
    throw new Error('An access key cannot sign key authorizations.')
  // A configurable account binds its authorization to itself.
  const boundFields = isConfigurableAccount(account)
    ? { account: account.address }
    : {}
  const authorization: KeyAuthorizationInput = {
    address: accessKeyAddress,
    chainId,
    expiry,
    limits,
    scopes,
    type,
    witness,
    ...boundFields,
  }
  return KeyAuthorization.getSignPayload(
    authorization as KeyAuthorization.KeyAuthorization,
  )
}

/**
 * Signs a key authorization for an access key (TIP-1044).
 *
 * @example
 * ```ts
 * import { Account } from 'viem/tempo'
 *
 * const keyAuthorization = await Account.signKeyAuthorization(account, {
 *   chainId: 1337,
 *   key: accessKey,
 * })
 * ```
 */
export async function signKeyAuthorization(
  account: viem_Account.Local,
  parameters: signKeyAuthorization.Parameters,
): Promise<signKeyAuthorization.ReturnValue> {
  const {
    chainId,
    expiry,
    key,
    limits,
    configurable: configurableState,
    scopes,
    signatures,
    witness,
  } = parameters
  const { accessKeyAddress, keyType: type } = resolveAccessKey(key)

  const isConfigurable = isConfigurableAccount(account)
  const boundFields = isConfigurable ? { account: account.address } : {}

  const hash = getKeyAuthorizationSignPayload(account, parameters)
  const signature = await (async () => {
    if (isConfigurable) {
      if (!configurableState)
        throw new Error(
          'Configurable account state is required to sign a key authorization.',
        )
      return SignatureEnvelope.serialize(
        await signConfigurable(account, {
          config: configurableState.config,
          payload: hash,
          signatures: signatures?.map((signature) => parseApproval(signature)),
        }),
      )
    }
    return account.sign!({ hash })
  })()
  const signed: KeyAuthorizationInput = {
    address: accessKeyAddress,
    chainId,
    expiry,
    limits,
    scopes,
    signature: SignatureEnvelope.from(signature),
    type,
    ...(witness ? { witness } : {}),
    ...boundFields,
  }
  return KeyAuthorization.from(signed as KeyAuthorization.Signed)
}

export declare namespace signKeyAuthorization {
  type Parameters = Pick<
    KeyAuthorization.KeyAuthorization,
    'expiry' | 'limits' | 'scopes' | 'witness'
  > & {
    chainId: number | bigint
    key: resolveAccessKey.Parameters
    /** @internal Current state used when a configurable account signs the authorization. */
    configurable?:
      | {
          config: AccountConfig.Config
        }
      | undefined
    /** Serialized approvals from external owners. */
    signatures?: readonly SignatureEnvelope.Serialized[] | undefined
  }

  type ReturnValue = KeyAuthorization.Signed
}

/** Resolves an access key input into its address and key type. @internal */
export function resolveAccessKey(
  accessKey: resolveAccessKey.Parameters,
): resolveAccessKey.ReturnType {
  if ('accessKeyAddress' in accessKey)
    return {
      accessKeyAddress: accessKey.accessKeyAddress,
      keyType: accessKey.keyType,
    }
  if ('publicKey' in accessKey && accessKey.publicKey)
    return {
      accessKeyAddress: Address.checksum(
        Address.fromPublicKey(PublicKey.fromHex(accessKey.publicKey)),
      ),
      keyType: accessKey.type,
    }
  return {
    accessKeyAddress: accessKey.address,
    keyType: accessKey.type,
  }
}

export declare namespace resolveAccessKey {
  type Parameters =
    | Pick<AccessKeyAccount, 'accessKeyAddress' | 'keyType'>
    | OneOf<
        | {
            /** Access key address, or the address of a configurable account (TIP-1111). */
            address: Address.Address
            /** Key type. `configurable` for a configurable account. */
            type: KeyAuthorization.KeyAuthorization['type']
          }
        | {
            /** Access key public key. */
            publicKey: Hex.Hex
            /** Key type. */
            type: SignatureEnvelope.Type
          }
      >

  type ReturnType = {
    accessKeyAddress: Address.Address
    keyType: KeyAuthorization.KeyAuthorization['type']
  }
}

/**
 * Returns a configurable account (TIP-1107) as JSON-safe public values: its
 * address and, when known, its config. {@link deserialize} rebuilds it.
 *
 * @example
 * ```ts
 * import { Account } from 'viem/tempo'
 *
 * localStorage.setItem('account', JSON.stringify(Account.serialize(account)))
 * ```
 *
 * @param account Configurable account.
 * @returns Serialized account.
 */
export function serialize(account: ConfigurableAccount): Serialized {
  const { address, config } = account
  return {
    address,
    ...(config ? { config: AccountConfig.toRpc(config) } : {}),
  }
}

/** Configurable account as JSON, which {@link serialize} returns and {@link deserialize} rebuilds. */
export type Serialized = {
  /** Account address. */
  address: Address.Address
  /** Current config, in RPC format. Absent for an address-only account. */
  config?: AccountConfig.Rpc | undefined
}

function fromBase(parameters: fromBase.Parameters): Base {
  const { keyType = 'secp256k1', parentAddress } = parameters

  const address = Address.checksum(
    parentAddress ?? Address.fromPublicKey(parameters.publicKey),
  )
  const publicKey = PublicKey.toHex(parameters.publicKey, {
    includePrefix: false,
  })

  async function sign(options: {
    hash: Hex.Hex
    raw?: boolean | undefined
  }): Promise<Hex.Hex> {
    const { hash, raw } = options
    if (raw) return await parameters.sign({ hash })
    if (!parentAddress) return await parameters.sign({ hash })
    // Keychain (v2) inner hash: binds the signature to the parent account.
    const innerHash = Hash.keccak256(Hex.concat('0x04', hash, parentAddress))
    const signature = await parameters.sign({ hash: innerHash })
    return SignatureEnvelope.serialize(
      SignatureEnvelope.from({
        inner: SignatureEnvelope.from(signature),
        type: 'keychain',
        userAddress: parentAddress,
        version: 'v2',
      }),
    )
  }

  return {
    address,
    keyType,
    sign,
    async signAuthorization(authorization) {
      const signature = await sign({
        hash: Authorization.getSignPayload(authorization),
      })
      const envelope = SignatureEnvelope.from(signature)
      if (envelope.type !== 'secp256k1')
        throw new Error(
          'Unsupported signature type. Expected `secp256k1` but got `' +
            envelope.type +
            '`.',
        )
      return Authorization.from(authorization, {
        signature: envelope.signature,
      })
    },
    async signMessage({ message }) {
      return await sign({
        hash: PersonalMessage.getSignPayload(toPayload(message)),
      })
    },
    async signTransaction(envelope_, options) {
      const chain = options?.chain
      // The envelope originates from the tempo chain's `toEnvelope` (or is a
      // Tempo envelope directly); `feePayer` and `accountSimulation` ride it as
      // request metadata.
      const envelope = (() => {
        const envelope =
          envelope_ as unknown as TxEnvelopeTempo.TxEnvelopeTempo & {
            feePayer?: Envelope['feePayer'] | undefined
            accountSimulation?: Envelope['accountSimulation'] | undefined
          }
        // A sponsored request signs the sponsored payload (excluding
        // `feeToken`), which the `feePayerSignature: null` marker selects.
        if (
          envelope.feePayer &&
          typeof envelope.feePayerSignature === 'undefined'
        )
          return { ...envelope, feePayerSignature: null }
        return envelope
      })()

      // Non-tempo envelopes take the generic path (secp256k1 signatures
      // only; other key types cannot produce valid signatures for them).
      if (envelope.type && envelope.type !== 'tempo') {
        const signature = SignatureEnvelope.from(
          await sign({
            hash: TxEnvelope.getSignPayload(
              envelope_ as TxEnvelope.TxEnvelope<false>,
            ),
          }),
        )
        if (signature.type !== 'secp256k1')
          throw new Error(
            'Unsupported signature type. Expected `secp256k1` but got `' +
              signature.type +
              '`.',
          )
        return TxEnvelope.serialize(envelope_, {
          signature: signature.signature,
        })
      }

      const getSignPayload = chain?.transaction?.getSignPayload as
        | ((envelope: unknown) => Hex.Hex | undefined)
        | undefined
      const payload =
        getSignPayload?.(envelope) ?? TxEnvelopeTempo.getSignPayload(envelope)

      // Configurable account (TIP-1107): return this owner's approval — a
      // primitive signature over the owner approval digest — instead
      // of a full serialized transaction. Approvals are combined later via
      // `signatures`.
      if (envelope.accountSimulation) {
        if (!envelope.from)
          throw new Error(
            'A configurable account sender is required for signing.',
          )
        const { from } = envelope
        const { signer = from } = envelope.accountSimulation
        // Owners of a configurable access key (TIP-1111) approve its keychain
        // digest, bound to the sender.
        const digest = AccountConfig.getSignPayload({
          payload: Address.isEqual(signer, from)
            ? payload
            : Hash.keccak256(Hex.concat('0x04', payload, from)),
          account: signer,
          config: AccountConfig.from(envelope.accountSimulation.config),
        })
        return await sign({ hash: digest, raw: true })
      }

      const signature = await sign({ hash: payload })
      const serialize = chain?.transaction?.serialize as
        | ((envelope: unknown, options?: unknown) => Hex.Hex | undefined)
        | undefined
      const signatureEnvelope = SignatureEnvelope.from(signature)
      const serialized =
        serialize?.(envelope, { signature: signatureEnvelope }) ??
        // A prefilled fee-payer signature (e.g. from `eth_fillTransaction`)
        // completes the envelope; otherwise hand off in the fee payer format.
        (envelope.feePayer && !envelope.feePayerSignature
          ? TxEnvelopeTempo.serialize(envelope, {
              format: 'feePayer',
              sender: envelope.from ?? address,
              signature: signatureEnvelope,
            })
          : TxEnvelopeTempo.serialize(envelope, {
              signature: signatureEnvelope,
            }))
      if (
        typeof envelope.feePayer === 'object' &&
        serialized.startsWith(TxEnvelopeTempo.feePayerMagic)
      )
        return await signFeePayer(
          serialized,
          envelope.feePayer,
          envelope.from ?? address,
        )
      return serialized
    },
    async signTypedData(typedData) {
      return await sign({
        hash: TypedData.getSignPayload(typedData as TypedData.encode.Value),
      })
    },
    async signVoucher(parameters) {
      const hash = getVoucherSignPayload(parameters)
      if (parentAddress) return await sign({ hash, raw: true })
      return await sign({ hash })
    },
    publicKey,
    source: 'root',
    type: 'local',
  }
}

async function signFeePayer(
  serialized: Hex.Hex,
  feePayer: viem_Account.Account,
  sender: Address.Address,
): Promise<Hex.Hex> {
  if (!feePayer.sign)
    throw new Error('`feePayer` account does not implement `sign`.')

  // Fee-payer handoffs share the Tempo body under a different prefix.
  const transaction = TxEnvelopeTempo.deserialize(
    serialized.replace(
      TxEnvelopeTempo.feePayerMagic,
      TxEnvelopeTempo.serializedType,
    ) as TxEnvelopeTempo.Serialized,
  )
  const signature = await feePayer.sign({
    hash: TxEnvelopeTempo.getFeePayerSignPayload(transaction, { sender }),
  })
  return TxEnvelopeTempo.serialize(transaction, {
    feePayerSignature: Signature.from(signature),
  })
}

declare namespace fromBase {
  type Parameters = {
    /** Parent address (access key accounts). */
    parentAddress?: Address.Address | undefined
    /** Public key. */
    publicKey: PublicKey.PublicKey
    /** Key type. */
    keyType?: SignatureEnvelope.Type | undefined
    /** Pending key authorization manager. */
    keyAuthorizationManager?:
      | KeyAuthorizationManager.KeyAuthorizationManager
      | undefined
    /** Sign function. */
    sign: (parameters: { hash: Hex.Hex }) => Hex.Hex | Promise<Hex.Hex>
  }

  type ReturnValue = Base
}

function fromRoot(parameters: fromRoot.Parameters): RootAccount {
  const account = fromBase(parameters)
  return {
    ...account,
    source: 'root',
    async signKeyAuthorization(key, parameters) {
      const { chainId, expiry, limits, scopes, witness } = parameters
      const { accessKeyAddress, keyType: type } = resolveAccessKey(key)
      const authorization: KeyAuthorizationInput = {
        address: accessKeyAddress,
        chainId,
        expiry,
        limits,
        scopes,
        type,
        witness,
      }
      const signature = await account.sign({
        hash: KeyAuthorization.getSignPayload(
          authorization as KeyAuthorization.KeyAuthorization,
        ),
      })
      const signed: KeyAuthorizationInput = {
        address: accessKeyAddress,
        chainId,
        expiry,
        limits,
        scopes,
        signature: SignatureEnvelope.from(signature),
        type,
        ...(witness ? { witness } : {}),
      }
      return KeyAuthorization.from(signed as KeyAuthorization.Signed)
    },
  }
}

declare namespace fromRoot {
  type Parameters = fromBase.Parameters

  type ReturnValue = RootAccount
}

function fromAccessKey(parameters: fromAccessKey.Parameters): AccessKeyAccount {
  const { access, keyAuthorization } = parameters
  const parentAddress = typeof access === 'string' ? access : access.address
  const accessKeyAddress = Address.checksum(
    Address.fromPublicKey(parameters.publicKey),
  )
  if (
    keyAuthorization &&
    !Address.isEqual(keyAuthorization.address, accessKeyAddress)
  )
    throw new Error('Key authorization does not authorize this access key.')
  const keyAuthorizationManager =
    parameters.keyAuthorizationManager ??
    (keyAuthorization ? pending(keyAuthorization) : undefined)
  const account = fromBase({
    ...parameters,
    keyAuthorizationManager,
    parentAddress,
  })
  return {
    ...account,
    accessKeyAddress,
    keyAuthorizationManager,
    source: 'accessKey',
  }
}

declare namespace fromAccessKey {
  type Parameters = fromBase.Parameters & {
    /**
     * Parent account to access.
     * If defined, this account will act as an "access key", and use
     * the parent account's address as the keychain address.
     */
    access: viem_Account.Account | Address.Address
    /**
     * Signed key authorization of the access key, which the account attaches
     * to its transactions until the chain registers the access key. Ignored
     * when `keyAuthorizationManager` is set.
     */
    keyAuthorization?: KeyAuthorization.Signed | undefined
    /** Pending key authorization manager. */
    keyAuthorizationManager?:
      | KeyAuthorizationManager.KeyAuthorizationManager
      | undefined
  }

  type ReturnValue = AccessKeyAccount
}

/**
 * Returns a key authorization manager that holds `keyAuthorization` until the
 * chain registers its access key.
 */
function pending(
  keyAuthorization: KeyAuthorization.Signed,
): KeyAuthorizationManager.KeyAuthorizationManager {
  let value: KeyAuthorization.Signed | undefined = keyAuthorization
  const matches = (key: KeyAuthorizationManager.Key) =>
    Address.isEqual(key.accessKey, keyAuthorization.address) &&
    BigInt(key.chainId) === BigInt(keyAuthorization.chainId)
  return {
    get: (key) => (matches(key) ? value : undefined),
    remove(key) {
      if (matches(key)) value = undefined
    },
    set(key, next) {
      if (matches(key)) value = next
    },
  }
}

/** Thrown when a version-zero config does not derive the account's address. */
export class AddressMismatchError extends Errors.BaseError {
  override readonly name = 'Account.AddressMismatchError'
  /** Address the config derives. */
  readonly derived: Address.Address

  constructor(options: { address: Address.Address; derived: Address.Address }) {
    const { address, derived } = options
    super(`Account config derives ${derived}, not ${address}.`)
    this.derived = derived
  }
}

function toPayload(
  message: viem_Account.SignableMessage,
): Hex.Hex | Bytes.Bytes {
  if (typeof message === 'string') return Hex.fromString(message)
  return message.raw
}
