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
  Channel,
  KeyAuthorization,
  MultisigConfig,
  SignatureEnvelope,
  TxEnvelopeTempo,
} from 'ox/tempo'

import * as viem_Account from '../core/Account.js'
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
export type AccessKeyAccount = Base<'accessKey'> & {
  /** Access key address. */
  accessKeyAddress: Address.Address
  /** Pending key authorization manager. */
  keyAuthorizationManager?:
    | KeyAuthorizationManager.KeyAuthorizationManager
    | undefined
}

/** A Tempo account. */
export type Account = OneOf<RootAccount | AccessKeyAccount | MultisigAccount>

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
  const { access, keyAuthorizationManager, rpId, origin } = options

  const publicKey = P256.getPublicKey({ privateKey })

  return from({
    ...(access ? { access, keyAuthorizationManager } : {}),
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
    Pick<from.Parameters, 'access' | 'keyAuthorizationManager'> & {
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
  const { access, keyAuthorizationManager } = options
  const publicKey = P256.getPublicKey({ privateKey })

  return from({
    ...(access ? { access, keyAuthorizationManager } : {}),
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
  type Options = Pick<from.Parameters, 'access' | 'keyAuthorizationManager'>

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
  const { access, keyAuthorizationManager } = options
  const publicKey = Secp256k1.getPublicKey({ privateKey })

  return from({
    ...(access ? { access, keyAuthorizationManager } : {}),
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
  type Options = Pick<from.Parameters, 'access' | 'keyAuthorizationManager'>

  type ReturnValue<options extends Options = Options> =
    from.ReturnValue<options>
}

/**
 * Instantiates an Account for a native multisig (TIP-1061) config.
 *
 * The returned account does not hold a key itself. Omit `address` or set it to
 * `infer` to derive an account address from its initial config. For a current
 * config, set `address` to the stable account address. Pass the address directly
 * for an address-only account.
 *
 * Owners can be accounts or addresses directly, or weighted `{ owner, weight }`
 * entries. Direct owners default to weight `1`, and `threshold` defaults to `1`.
 * Local owner accounts are retained for signing, including nested multisigs.
 * Configs containing only owner addresses require external approvals through
 * `signatures`.
 *
 * Normalizes supplied config fields with `MultisigConfig.from`, so callers do
 * not need to normalize owner ordering themselves.
 *
 * @example
 * ```ts
 * import { Account } from 'viem/tempo'
 *
 * const account = Account.fromMultisig({
 *   address: 'infer',
 *   owners: [owner_1, owner_2],
 *   threshold: 2,
 * })
 *
 * // The multisig config is inferred from the account.
 * const { request } = await client.transaction.prepare({ account, ...rest })
 *
 * const transaction = await client.transaction.sign(request)
 * ```
 *
 * @param value Initial config, current config, or multisig address.
 * @returns Multisig account.
 */
export function fromMultisig(
  value: fromMultisig.InitialConfig,
): MultisigAccount<MultisigConfig.Config>
export function fromMultisig(
  value: fromMultisig.CurrentConfig,
): MultisigAccount<MultisigConfig.Config>
export function fromMultisig(
  address: Address.Address,
): MultisigAccount<undefined>
export function fromMultisig(value: fromMultisig.Parameters): MultisigAccount
export function fromMultisig(value: fromMultisig.Parameters): MultisigAccount {
  const configInput = (() => {
    if (typeof value === 'string') return undefined
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
    return MultisigConfig.from({
      ...configInput,
      owners: ownerEntries.map(({ owner, weight }) => ({
        owner: typeof owner === 'string' ? owner : owner.address,
        weight,
      })),
      threshold: configInput.threshold ?? 1,
    })
  })()
  if (typeof value !== 'string') {
    if (
      (value.address === undefined || value.address === 'infer') &&
      config!.version !== 0n
    )
      throw new Error('An initial multisig config must have version zero.')
    if (
      value.address !== undefined &&
      value.address !== 'infer' &&
      config!.version === 0n
    )
      throw new Error('A current multisig config must have a version.')
  }
  const address = Address.checksum(
    (() => {
      if (typeof value === 'string') return value
      if (value.address === undefined || value.address === 'infer')
        return MultisigConfig.getAddress(config!)
      return value.address
    })(),
  )
  const ownerAccounts = (() => {
    if (!configInput) return []
    return configInput.owners.flatMap((value) => {
      const owner =
        typeof value === 'string' || 'address' in value ? value : value.owner
      return typeof owner === 'string' ? [] : [viem_Account.from(owner)]
    })
  })()
  const owners =
    config?.owners.flatMap(({ owner }) => {
      const account = ownerAccounts.find((account) =>
        Address.isEqual(account.address, owner),
      )
      return account ? [account] : []
    }) ?? []

  const account: MultisigAccount = {
    address,
    config,
    owners,
    publicKey: '0x',
    source: 'multisig',
    keyType: 'multisig',
    type: 'local',
    async sign({ hash }) {
      return SignatureEnvelope.serialize(
        await signMultisig(account, { payload: hash }),
      )
    },
    async signMessage() {
      throw new Error('`signMessage` is not supported for multisig accounts.')
    },
    async signTransaction(envelope_, options) {
      const request = envelope_ as unknown as Envelope
      const serialize = options?.chain?.transaction?.serialize as
        | ((
            envelope: Envelope,
            options?: SerializeOptions,
          ) => Hex.Hex | undefined)
        | undefined
      const serializeTransaction = async (
        envelope: Envelope,
        options?: SerializeOptions,
      ) => {
        const serialized =
          serialize?.(envelope, options) ??
          chainConfig.transaction.serialize(envelope, options)!
        if (
          typeof envelope.feePayer === 'object' &&
          serialized.startsWith(TxEnvelopeTempo.feePayerMagic)
        )
          return signFeePayer(
            serialized,
            envelope.feePayer,
            envelope.from ?? address,
          )
        return serialized
      }
      if (request.owner) {
        const owner = request.owner
        if (owner.type !== 'local')
          throw new Error(
            'A local owner account is required to approve a multisig transaction.',
          )
        if (owner.source !== 'root' && owner.source !== 'multisig')
          throw new Error(
            'A Tempo owner account is required to approve a multisig transaction.',
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
      const payload = TxEnvelopeTempo.getSignPayload(request)
      const simulation = request.multisigSimulation
      const requestAccount = simulation?.account ?? address
      if (!Address.isEqual(requestAccount, address)) {
        if (!simulation)
          throw new Error('A multisig config is required for local signing.')
        const parentDigest = MultisigConfig.getSignPayload({
          account: requestAccount,
          config: MultisigConfig.from(simulation.config),
          payload,
        })
        return SignatureEnvelope.serialize(
          await signMultisig(account, { payload: parentDigest }),
        )
      }
      const signature = await signMultisig(account, {
        config: simulation?.config,
        payload,
        signatures: request.signatures?.map((signature) =>
          SignatureEnvelope.from(signature),
        ),
      })
      return serializeTransaction(request, { signature })
    },
    async signTypedData() {
      throw new Error('`signTypedData` is not supported for multisig accounts.')
    },
  }
  return account
}

export declare namespace fromMultisig {
  /** Initial version-zero multisig config. */
  export type Config = InitialConfig

  /** Stable multisig account address and its current config. */
  export type CurrentConfig = {
    /** Stable multisig account address. */
    address: Address.Address
    /** Weighted owners. */
    owners: readonly Owner[]
    /** Caller-chosen 32-byte salt. */
    salt: MultisigConfig.Config['salt']
    /** Minimum total owner weight required for authorization. */
    threshold: MultisigConfig.Config['threshold']
    /** Current configuration version. */
    version: MultisigConfig.Config<bigint | number>['version']
  }

  /** Initial version-zero multisig config. */
  export type InitialConfig = {
    /** Derives the stable account address from this initial config. */
    address?: 'infer' | undefined
    /** Weighted owners. */
    owners: readonly Owner[]
    /** Caller-chosen 32-byte salt. */
    salt?: MultisigConfig.Input['salt'] | undefined
    /** Minimum owner weight required for authorization. */
    threshold?: number | undefined
    /** Initial configuration version. */
    version?: 0 | 0n | undefined
  }

  /** Multisig owner account or address, optionally with an explicit weight. */
  export type Owner =
    | Address.Address
    | viem_Account.Local
    | (Omit<MultisigConfig.Owner, 'owner'> & {
        owner: Address.Address | viem_Account.Local
      })

  /** Parameters for {@link fromMultisig}. */
  export type Parameters = Address.Address | CurrentConfig | InitialConfig
}

export type MultisigAccount<
  config extends MultisigConfig.Config | undefined =
    | MultisigConfig.Config
    | undefined,
> = viem_Account.Local<'multisig'> & {
  /** Account source. */
  source: 'multisig'
  /** Normalized config, or `undefined` for an address-only account. */
  config: config
  /** @internal Local owner accounts available for signing. */
  owners: readonly (viem_Account.Local & { source?: string | undefined })[]
}

function isMultisigAccount(
  account: viem_Account.Local,
): account is MultisigAccount {
  return 'source' in account && account.source === 'multisig'
}

async function signMultisig(
  account: MultisigAccount,
  parameters: {
    config?: MultisigConfig.Config | undefined
    payload: Hex.Hex
    signatures?: readonly SignatureEnvelope.SignatureEnvelope[] | undefined
  },
): Promise<SignatureEnvelope.Multisig> {
  const { config, payload, signatures: providedSignatures = [] } = parameters
  const currentConfig = config ?? account.config
  if (!currentConfig)
    throw new Error('A current multisig config is required for local signing.')
  const digest = MultisigConfig.getSignPayload({
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
    const address = owner.owner.toLowerCase() as Address.Address
    if (signedOwners.has(address)) continue
    const ownerAccount = account.owners.find((account) =>
      Address.isEqual(account.address, owner.owner),
    )
    if (!ownerAccount) continue

    if (isMultisigAccount(ownerAccount)) {
      signatures.push(
        await signMultisig(ownerAccount, {
          payload: digest,
        }),
      )
    } else {
      if (!ownerAccount.sign)
        throw new Error('Multisig owner account cannot sign.')
      signatures.push(
        SignatureEnvelope.from(await ownerAccount.sign({ hash: digest })),
      )
    }

    signedOwners.add(address)
    weight += Number(owner.weight)
    if (weight >= Number(currentConfig.threshold)) break
  }

  if (weight < Number(currentConfig.threshold))
    throw new Error('Local multisig owners do not meet the threshold.')

  return SignatureEnvelope.from({
    account: account.address,
    config: currentConfig,
    signatures: SignatureEnvelope.sortMultisigApprovals({
      account: account.address,
      config: currentConfig,
      payload,
      signatures,
    }),
  }) as SignatureEnvelope.Multisig
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
  const { access, keyAuthorizationManager } = options
  const { publicKey, privateKey } = keyPair

  return from({
    ...(access ? { access, keyAuthorizationManager } : {}),
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
  type Options = Pick<from.Parameters, 'access' | 'keyAuthorizationManager'>

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
 * Key-authorization fields as built here: `account` and `isAdmin` vary
 * independently (ox's type pairs them) and `chainId` stays numberish.
 * @internal
 */
type KeyAuthorizationInput = {
  account?: Address.Address | undefined
  address: Address.Address
  chainId: number | bigint
  expiry?: number | null | undefined
  isAdmin?: boolean | undefined
  limits?: readonly KeyAuthorization.TokenLimit[] | undefined
  scopes?: readonly KeyAuthorization.Scope[] | undefined
  signature?: SignatureEnvelope.SignatureEnvelope | undefined
  type: SignatureEnvelope.Type
  witness?: Hex.Hex | undefined
}

/**
 * Signs a key authorization for an access key (TIP-1044).
 *
 * When the signer is an admin access key, the authorization is signed
 * directly by that key and bound to the parent account it acts on behalf of,
 * so the signed payload cannot be replayed against another account (TIP-1049).
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
export function getKeyAuthorizationSignPayload(
  account: viem_Account.Local,
  parameters: signKeyAuthorization.Parameters,
): Hex.Hex {
  const { admin, chainId, expiry, key, limits, scopes, witness } = parameters
  const { accessKeyAddress, keyType: type } = resolveAccessKey(key)
  const boundFields =
    isAccessKeyAccount(account) || isMultisigAccount(account)
      ? { account: account.address }
      : {}
  const restrictions = admin ? {} : { expiry, limits, scopes }
  return KeyAuthorization.getSignPayload({
    address: accessKeyAddress,
    chainId,
    type,
    witness,
    ...(admin ? { isAdmin: true } : {}),
    ...boundFields,
    ...restrictions,
  } as KeyAuthorization.KeyAuthorization)
}

export async function signKeyAuthorization(
  account: viem_Account.Local,
  parameters: signKeyAuthorization.Parameters,
): Promise<signKeyAuthorization.ReturnValue> {
  const {
    admin,
    chainId,
    expiry,
    key,
    limits,
    multisig: multisigState,
    scopes,
    signatures,
    witness,
  } = parameters
  const { accessKeyAddress, keyType: type } = resolveAccessKey(key)

  // When the signer is an admin access key, the authorization must be
  // signed directly by that key and bound to the parent account it acts
  // on behalf of, so the signed payload cannot be replayed against another
  // account. [TIP-1049]
  const isAccessKey = isAccessKeyAccount(account)
  const isMultisig = isMultisigAccount(account)
  const boundFields =
    isAccessKey || isMultisig ? { account: account.address } : {}

  // Admin key authorizations are unrestricted and must not carry expiry,
  // limits, or call scopes (the protocol rejects them). [TIP-1049]
  const restrictions = admin ? {} : { expiry, limits, scopes }

  const hash = getKeyAuthorizationSignPayload(account, parameters)
  const signature = await (async () => {
    if (isAccessKey) return account.sign({ hash, raw: true })
    if (isMultisig) {
      if (!multisigState)
        throw new Error(
          'Multisig state is required to sign a key authorization.',
        )
      return SignatureEnvelope.serialize(
        await signMultisig(account, {
          config: multisigState.config,
          payload: hash,
          signatures: signatures?.map((signature) =>
            SignatureEnvelope.from(signature),
          ),
        }),
      )
    }
    return account.sign!({ hash })
  })()
  return KeyAuthorization.from({
    address: accessKeyAddress,
    chainId,
    signature: SignatureEnvelope.from(signature),
    type,
    ...(witness ? { witness } : {}),
    ...(admin ? { isAdmin: true } : {}),
    ...boundFields,
    ...restrictions,
  } as KeyAuthorization.Signed)
}

export declare namespace signKeyAuthorization {
  type Parameters = Pick<
    KeyAuthorization.KeyAuthorization,
    'expiry' | 'limits' | 'scopes' | 'witness'
  > & {
    /**
     * Whether to authorize the key as an admin key. Admin keys are
     * unrestricted and can manage the account's other access keys; `expiry`,
     * `limits`, and `scopes` are ignored. Requires the T6 hardfork.
     *
     * [TIP-1049](https://tips.sh/1049)
     */
    chainId: number | bigint
    admin?: boolean | undefined
    key: resolveAccessKey.Parameters
    /** @internal Current state used when a multisig account signs the authorization. */
    multisig?:
      | {
          config: MultisigConfig.Config
        }
      | undefined
    /** Serialized approvals from external multisig owners. */
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
            /** Access key address. */
            address: Address.Address
            /** Key type. */
            type: SignatureEnvelope.Type
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
    keyType: SignatureEnvelope.Type
  }
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
      // Tempo envelope directly); `feePayer` and `multisigSimulation` ride it as
      // request metadata.
      const envelope =
        envelope_ as unknown as TxEnvelopeTempo.TxEnvelopeTempo & {
          feePayer?: viem_Account.Account | boolean | undefined
          multisigSimulation?: Envelope['multisigSimulation'] | undefined
        }

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

      // Native multisig (TIP-1061): return this owner's approval — a
      // primitive signature over the multisig owner approval digest — instead
      // of a full serialized transaction. Approvals are combined later via
      // `signatures`.
      if (envelope.multisigSimulation) {
        const digest = MultisigConfig.getSignPayload({
          payload,
          account: envelope.multisigSimulation.account,
          config: MultisigConfig.from(envelope.multisigSimulation.config),
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
        (envelope.feePayer
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
      const { chainId, expiry, limits, scopes, witness, admin } = parameters
      const { accessKeyAddress, keyType: type } = resolveAccessKey(key)

      // Admin key authorizations are unrestricted and must not carry expiry,
      // limits, or call scopes (the protocol rejects them). [TIP-1049]
      const restrictions = admin ? {} : { expiry, limits, scopes }

      const authorization: KeyAuthorizationInput = {
        address: accessKeyAddress,
        chainId,
        type,
        witness,
        ...(admin ? { isAdmin: true } : {}),
        ...restrictions,
      }
      const signature = await account.sign({
        // The wire accepts `account`/`isAdmin` alone (see KeyAuthorizationInput).
        hash: KeyAuthorization.getSignPayload(
          authorization as KeyAuthorization.KeyAuthorization,
        ),
      })
      const signed: KeyAuthorizationInput = {
        address: accessKeyAddress,
        chainId,
        signature: SignatureEnvelope.from(signature),
        type,
        ...(witness ? { witness } : {}),
        ...(admin ? { isAdmin: true } : {}),
        ...restrictions,
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
  const { access, keyAuthorizationManager } = parameters
  const parentAddress = typeof access === 'string' ? access : access.address
  const account = fromBase({ ...parameters, parentAddress })
  return {
    ...account,
    accessKeyAddress: Address.checksum(
      Address.fromPublicKey(parameters.publicKey),
    ),
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
    /** Pending key authorization manager. */
    keyAuthorizationManager?:
      | KeyAuthorizationManager.KeyAuthorizationManager
      | undefined
  }

  type ReturnValue = AccessKeyAccount
}

function toPayload(
  message: viem_Account.SignableMessage,
): Hex.Hex | Bytes.Bytes {
  if (typeof message === 'string') return Hex.fromString(message)
  return message.raw
}
