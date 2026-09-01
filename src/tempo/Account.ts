import * as Address from 'ox/Address'
import * as Hex from 'ox/Hex'
import * as P256 from 'ox/P256'
import * as PublicKey from 'ox/PublicKey'
import * as Secp256k1 from 'ox/Secp256k1'
import * as Signature from 'ox/Signature'
import {
  Channel,
  KeyAuthorization,
  MultisigConfig,
  SignatureEnvelope,
} from 'ox/tempo'
import * as WebAuthnP256 from 'ox/WebAuthnP256'
import * as WebCryptoP256 from 'ox/WebCryptoP256'
import type {
  LocalAccount,
  Account as viem_Account,
} from '../accounts/types.js'
import { parseAccount } from '../accounts/utils/parseAccount.js'
import type { TransactionSerializable } from '../types/transaction.js'
import type { OneOf, RequiredBy } from '../types/utils.js'
import { hashAuthorization } from '../utils/authorization/hashAuthorization.js'
import { keccak256 } from '../utils/hash/keccak256.js'
import { hashMessage } from '../utils/signature/hashMessage.js'
import { hashTypedData } from '../utils/signature/hashTypedData.js'
import type { SerializeTransactionFn } from '../utils/transaction/serializeTransaction.js'
import type { KeyAuthorizationManager } from './KeyAuthorizationManager.js'
import * as Transaction from './Transaction.js'

export type Account_base<source extends string = string> = RequiredBy<
  LocalAccount<source>,
  'sign' | 'signAuthorization' | 'signTransaction'
> & {
  /** Key type. */
  keyType: SignatureEnvelope.Type
  /** Sign fn. */
  sign: NonNullable<LocalAccount['sign']>
  /** Sign transaction fn. */
  signTransaction: <
    serializer extends
      SerializeTransactionFn<TransactionSerializable> = SerializeTransactionFn<Transaction.TransactionSerializableTempo>,
    transaction extends Parameters<serializer>[0] = Parameters<serializer>[0],
  >(
    transaction: transaction,
    options?:
      | {
          serializer?: serializer | undefined
        }
      | undefined,
  ) => Promise<Hex.Hex>
  /** Sign voucher fn. */
  signVoucher: (
    parameters: signVoucher.Parameters,
  ) => Promise<signVoucher.ReturnValue>
}

export type RootAccount = Account_base<'root'> & {
  /** Sign key authorization. */
  signKeyAuthorization: (
    key: resolveAccessKey.Parameters,
    parameters: Pick<
      KeyAuthorization.KeyAuthorization,
      'chainId' | 'expiry' | 'limits' | 'scopes' | 'witness'
    > & {
      /** Whether to authorize the key as an admin key (TIP-1049). */
      admin?: boolean | undefined
    },
  ) => Promise<KeyAuthorization.Signed>
}

export type AccessKeyAccount = Account_base<'accessKey'> & {
  /** Access key ID. */
  accessKeyAddress: Address.Address
  /** Pending key authorization manager. */
  keyAuthorizationManager?: KeyAuthorizationManager | undefined
  /**
   * Signs a hash.
   *
   * By default, access key accounts sign through a keychain envelope so the
   * signature authorizes the parent account.
   *
   * Set `raw` to `true` to sign directly with the access key, without keychain
   * hashing or keychain enveloping.
   */
  sign: (parameters: {
    /** Hash to sign. */
    hash: Hex.Hex
    /** Sign directly with the access key, without keychain hashing or enveloping. */
    raw?: boolean | undefined
  }) => Promise<Hex.Hex>
}

export type Account = OneOf<RootAccount | AccessKeyAccount>

/** Instantiates an Account. */
export function from<const parameters extends from.Parameters>(
  parameters: parameters | from.Parameters,
): from.ReturnValue<parameters> {
  const { access } = parameters
  if (access) return fromAccessKey(parameters) as never
  return fromRoot(parameters) as never
}

export declare namespace from {
  export type Parameters = OneOf<fromRoot.Parameters | fromAccessKey.Parameters>

  export type ReturnValue<
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
 * const account = Account.fromHeadlessWebAuthn('0x...')
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
  const { access, keyAuthorizationManager, rpId, origin, internal_version } =
    options

  const publicKey = P256.getPublicKey({ privateKey })

  return from({
    ...(access ? { access, keyAuthorizationManager } : {}),
    internal_version,
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
  }) as never
}

export declare namespace fromHeadlessWebAuthn {
  export type Options = Omit<
    WebAuthnP256.getSignPayload.Options,
    'challenge' | 'rpId' | 'origin'
  > &
    Pick<
      from.Parameters,
      'access' | 'internal_version' | 'keyAuthorizationManager'
    > & {
      rpId: string
      origin: string
    }

  export type ReturnValue<options extends Options = Options> =
    from.ReturnValue<options>
}

/**
 * Instantiates an Account from a P256 private key.
 *
 * @example
 * ```ts
 * import { Account } from 'viem/tempo'
 *
 * const account = Account.fromP256('0x...')
 * ```
 *
 * @param privateKey P256 private key.
 * @returns Account.
 */
export function fromP256<const options extends fromP256.Options>(
  privateKey: Hex.Hex,
  options: options | fromP256.Options = {},
): fromP256.ReturnValue<options> {
  const { access, keyAuthorizationManager, internal_version } = options
  const publicKey = P256.getPublicKey({ privateKey })

  return from({
    ...(access ? { access, keyAuthorizationManager } : {}),
    internal_version,
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
  }) as never
}

export declare namespace fromP256 {
  export type Options = Pick<
    from.Parameters,
    'access' | 'internal_version' | 'keyAuthorizationManager'
  >

  export type ReturnValue<options extends Options = Options> =
    from.ReturnValue<options>
}

/**
 * Instantiates an Account from a Secp256k1 private key.
 *
 * @example
 * ```ts
 * import { Account } from 'viem/tempo'
 *
 * const account = Account.fromSecp256k1('0x...')
 * ```
 *
 * @param privateKey Secp256k1 private key.
 * @returns Account.
 */
export function fromSecp256k1<const options extends fromSecp256k1.Options>(
  privateKey: Hex.Hex,
  options: options | fromSecp256k1.Options = {},
): fromSecp256k1.ReturnValue<options> {
  const { access, keyAuthorizationManager, internal_version } = options
  const publicKey = Secp256k1.getPublicKey({ privateKey })

  return from({
    ...(access ? { access, keyAuthorizationManager } : {}),
    internal_version,
    keyType: 'secp256k1',
    publicKey,
    async sign(parameters) {
      const { hash } = parameters
      const signature = Secp256k1.sign({ payload: hash, privateKey })
      return Signature.toHex(signature)
    },
  }) as never
}

export declare namespace fromSecp256k1 {
  export type Options = Pick<
    from.Parameters,
    'access' | 'internal_version' | 'keyAuthorizationManager'
  >

  export type ReturnValue<options extends Options = Options> =
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
 * const request = await client.prepareTransactionRequest({ account, ...rest })
 *
 * const transaction = await client.signTransaction(request)
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
      return typeof owner === 'string' ? [] : [parseAccount(owner)]
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
    type: 'local',
    async sign({ hash }) {
      return SignatureEnvelope.serialize(
        await signMultisig(account, { payload: hash }),
      )
    },
    async signMessage() {
      throw new Error('`signMessage` is not supported for multisig accounts.')
    },
    async signTransaction(transaction, options) {
      const { serializer = Transaction.serialize } = options ?? {}
      const request = transaction as Transaction.TransactionSerializableTempo
      if (request.owner) {
        const owner = parseAccount(request.owner)
        if (owner.type !== 'local')
          throw new Error(
            'A local owner account is required to approve a multisig transaction.',
          )
        if (owner.source !== 'root' && owner.source !== 'multisig')
          throw new Error(
            'A Tempo owner account is required to approve a multisig transaction.',
          )
        const { owner: _, ...ownerRequest } = request
        return await owner.signTransaction(ownerRequest as never, options)
      }
      if (owners.length === 0)
        return (await serializer(transaction as never)) as Hex.Hex

      const presign = {
        ...request,
        signatures: undefined,
        ...(request.feePayerSignature === undefined
          ? {}
          : { feePayerSignature: null }),
      }
      const payload = keccak256(await serializer(presign as never))
      const simulation = request.multisigSimulation
      const requestAccount = simulation?.account ?? address

      if (!Address.isEqual(requestAccount, address)) {
        if (!simulation)
          throw new Error('A multisig config is required for local signing.')
        const parentConfig = MultisigConfig.from(simulation.config)
        const parentDigest = MultisigConfig.getSignPayload({
          account: requestAccount,
          config: parentConfig,
          payload,
        })
        return SignatureEnvelope.serialize(
          await signMultisig(account, {
            payload: parentDigest,
          }),
        )
      }

      const signature = await signMultisig(account, {
        config: simulation?.config,
        payload,
        signatures: request.signatures?.map((signature) =>
          SignatureEnvelope.from(signature),
        ),
      })
      return (await serializer(
        transaction as never,
        signature as never,
      )) as Hex.Hex
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
    | LocalAccount
    | (Omit<MultisigConfig.Owner, 'owner'> & {
        owner: Address.Address | LocalAccount
      })

  /** Parameters for {@link fromMultisig}. */
  export type Parameters = Address.Address | CurrentConfig | InitialConfig
}

export type MultisigAccount<
  config extends MultisigConfig.Config | undefined =
    | MultisigConfig.Config
    | undefined,
> = RequiredBy<LocalAccount<'multisig'>, 'sign'> & {
  /** Normalized config, or `undefined` for an address-only account. */
  config: config
  /** @internal Local owner accounts available for signing. */
  owners: readonly LocalAccount[]
}

function isMultisigAccount(account: LocalAccount): account is MultisigAccount {
  return account.source === 'multisig'
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
 *
 * ### Create Passkey + Instantiate Account
 *
 * Create a credential with `WebAuthnP256.createCredential` and then instantiate
 * a Viem Account with `Account.fromWebAuthnP256`.
 *
 * It is highly recommended to store the credential's public key in an external store
 * for future use (ie. for future calls to `WebAuthnP256.getCredential`).
 *
 * ```ts
 * import { Account, WebAuthnP256 } from 'viem/tempo'
 * import { publicKeyStore } from './store'
 *
 * // 1. Create credential
 * const credential = await WebAuthnP256.createCredential({ name: 'Example' })
 *
 * // 2. Instantiate account
 * const account = Account.fromWebAuthnP256(credential)
 *
 * // 3. Store public key
 * await publicKeyStore.set(credential.id, credential.publicKey)
 *
 * ```
 *
 * @example
 *
 * ### Get Credential + Instantiate Account
 *
 * Gets a credential from `WebAuthnP256.getCredential` and then instantiates
 * an account with `Account.fromWebAuthnP256`.
 *
 * The `getPublicKey` function is required to fetch the public key paired with the credential
 * from an external store. The public key is required to derive the account's address.
 *
 * ```ts
 * import { Account, WebAuthnP256 } from 'viem/tempo'
 * import { publicKeyStore } from './store'
 *
 * // 1. Get credential
 * const credential = await WebAuthnP256.getCredential({
 *   async getPublicKey(credential) {
 *     // 2. Get public key from external store.
 *     return await publicKeyStore.get(credential.id)
 *   }
 * })
 *
 * // 3. Instantiate account
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
  export type Credential = {
    id: WebAuthnP256.P256Credential['id']
    publicKey: Hex.Hex
  }

  export type Options = {
    getFn?: WebAuthnP256.sign.Options['getFn'] | undefined
    rpId?: WebAuthnP256.sign.Options['rpId'] | undefined
  }

  export type ReturnValue = from.ReturnValue
}

/**
 * Instantiates an Account from a P256 private key.
 *
 * @example
 * ```ts
 * import { Account } from 'viem/tempo'
 * import { WebCryptoP256 } from 'ox'
 *
 * const keyPair = await WebCryptoP256.createKeyPair()
 *
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
  const { access, keyAuthorizationManager, internal_version } = options
  const { publicKey, privateKey } = keyPair

  return from({
    ...(access ? { access, keyAuthorizationManager } : {}),
    internal_version,
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
  }) as never
}

export declare namespace fromWebCryptoP256 {
  export type Options = Pick<
    from.Parameters,
    'access' | 'internal_version' | 'keyAuthorizationManager'
  >

  export type ReturnValue<options extends Options = Options> =
    from.ReturnValue<options>
}

export async function signVoucher(
  account: LocalAccount,
  parameters: signVoucher.Parameters,
): Promise<signVoucher.ReturnValue> {
  const hash = getVoucherSignPayload(parameters)
  if (isAccessKeyAccount(account)) return account.sign({ hash, raw: true })
  return account.sign!({ hash })
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
  account: LocalAccount,
): account is AccessKeyAccount {
  return account.source === 'accessKey' && 'accessKeyAddress' in account
}

/** @internal */
export function getKeyAuthorizationSignPayload(
  account: LocalAccount,
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
  } as never)
}

export async function signKeyAuthorization(
  account: LocalAccount,
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
  } as never)
}

export declare namespace signKeyAuthorization {
  type Parameters = Pick<
    KeyAuthorization.KeyAuthorization,
    'chainId' | 'expiry' | 'limits' | 'scopes' | 'witness'
  > & {
    /**
     * Whether to authorize the key as an admin key. Admin keys are
     * unrestricted and can manage the account's other access keys; `expiry`,
     * `limits`, and `scopes` are ignored. Requires the T6 hardfork.
     *
     * [TIP-1049](https://tips.sh/1049)
     */
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

/** @internal */
// biome-ignore lint/correctness/noUnusedVariables: _
function fromBase(parameters: fromBase.Parameters): Account_base {
  const {
    keyType = 'secp256k1',
    parentAddress,
    source = 'privateKey',
    internal_version = 'v2',
  } = parameters

  const address = parentAddress ?? Address.fromPublicKey(parameters.publicKey)
  const publicKey = PublicKey.toHex(parameters.publicKey, {
    includePrefix: false,
  })

  async function sign({ hash, raw }: { hash: Hex.Hex; raw?: boolean }) {
    if (raw) return await parameters.sign({ hash })
    const innerHash =
      parentAddress && internal_version === 'v2'
        ? keccak256(Hex.concat('0x04', hash, parentAddress))
        : hash
    const signature = await parameters.sign({ hash: innerHash })
    if (parentAddress)
      return SignatureEnvelope.serialize(
        SignatureEnvelope.from({
          userAddress: parentAddress,
          inner: SignatureEnvelope.from(signature),
          type: 'keychain',
          version: internal_version,
        }),
      )
    return signature
  }

  return {
    address: Address.checksum(address),
    keyType,
    sign,
    async signAuthorization(parameters) {
      const { chainId, nonce } = parameters
      const address = parameters.contractAddress ?? parameters.address
      const signature = await sign({
        hash: hashAuthorization({ address, chainId, nonce }),
      })
      const envelope = SignatureEnvelope.from(signature)
      if (envelope.type !== 'secp256k1')
        throw new Error(
          'Unsupported signature type. Expected `secp256k1` but got `' +
            envelope.type +
            '`.',
        )
      const { r, s, yParity } = envelope.signature
      return {
        address,
        chainId,
        nonce,
        r: Hex.fromNumber(r, { size: 32 }),
        s: Hex.fromNumber(s, { size: 32 }),
        yParity,
      }
    },
    async signMessage(parameters) {
      const { message } = parameters
      return await sign({ hash: hashMessage(message) })
    },
    async signTransaction(transaction, options) {
      const { serializer = Transaction.serialize } = options ?? {}
      const presign = (() => {
        if ('feePayerSignature' in transaction && transaction.feePayerSignature)
          return { ...transaction, feePayerSignature: null }
        return transaction
      })()

      const payload = keccak256(await serializer(presign))

      // Native multisig (TIP-1061): return this owner's approval, a serialized
      // primitive signature over the multisig owner approval digest, instead of
      // a full serialized transaction. Approvals are combined later in
      // `sendTransaction({ signatures })`.
      const { multisigSimulation } = transaction as {
        multisigSimulation?: {
          account: Address.Address
          config: MultisigConfig.Config
        }
      }
      if (multisigSimulation) {
        const config = MultisigConfig.from(multisigSimulation.config)
        const digest = MultisigConfig.getSignPayload({
          account: multisigSimulation.account,
          config,
          payload,
        })
        return await sign({ hash: digest, raw: true })
      }

      const signature = await sign({ hash: payload })
      const envelope = SignatureEnvelope.from(signature)
      return await serializer(transaction, envelope as never)
    },
    async signTypedData(typedData) {
      return await sign({ hash: hashTypedData(typedData) })
    },
    async signVoucher(parameters) {
      const hash = getVoucherSignPayload(parameters)
      if (parentAddress) return await sign({ hash, raw: true })
      return await sign({ hash })
    },
    publicKey,
    source,
    type: 'local',
  }
}

declare namespace fromBase {
  export type Parameters = {
    /** Parent address. */
    parentAddress?: Address.Address | undefined
    /** Public key. */
    publicKey: PublicKey.PublicKey
    /** Key type. */
    keyType?: SignatureEnvelope.Type | undefined
    /** Pending key authorization manager. */
    keyAuthorizationManager?: KeyAuthorizationManager | undefined
    /** Sign function. */
    sign: NonNullable<LocalAccount['sign']>
    /** Source. */
    source?: string | undefined
    /** Access key version. Will be removed in a future release. @deprecated @internal */
    internal_version?: 'v1' | 'v2' | undefined
  }

  export type ReturnValue = Account_base
}

/** @internal */
// biome-ignore lint/correctness/noUnusedVariables: _
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

      const signature = await account.sign({
        hash: KeyAuthorization.getSignPayload({
          address: accessKeyAddress,
          chainId,
          type,
          witness,
          ...(admin ? { isAdmin: true } : {}),
          ...restrictions,
        } as never),
      })
      const keyAuthorization = KeyAuthorization.from({
        address: accessKeyAddress,
        chainId,
        signature: SignatureEnvelope.from(signature),
        type,
        ...(witness ? { witness } : {}),
        ...(admin ? { isAdmin: true } : {}),
        ...restrictions,
      } as never)
      return keyAuthorization
    },
  }
}

declare namespace fromRoot {
  export type Parameters = fromBase.Parameters

  export type ReturnValue = RootAccount
}

// biome-ignore lint/correctness/noUnusedVariables: _
function fromAccessKey(parameters: fromAccessKey.Parameters): AccessKeyAccount {
  const { access, keyAuthorizationManager } = parameters
  const { address: parentAddress } = parseAccount(access)
  const account = fromBase({ ...parameters, parentAddress })
  return {
    ...account,
    accessKeyAddress: Address.fromPublicKey(parameters.publicKey),
    keyAuthorizationManager,
    source: 'accessKey',
  }
}

declare namespace fromAccessKey {
  export type Parameters = fromBase.Parameters & {
    /**
     * Parent account to access.
     * If defined, this account will act as an "access key", and use
     * the parent account's address as the keychain address.
     */
    access: viem_Account | Address.Address
    /** Pending key authorization manager. */
    keyAuthorizationManager?: KeyAuthorizationManager | undefined
  }

  export type ReturnValue = AccessKeyAccount
}

/** @internal */
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
      accessKeyAddress: Address.fromPublicKey(
        PublicKey.fromHex(accessKey.publicKey),
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

// Export types required for inference.
// biome-ignore lint/performance/noBarrelFile: _
export {
  /** @deprecated */
  KeyAuthorization as z_KeyAuthorization,
  /** @deprecated */
  SignatureEnvelope as z_SignatureEnvelope,
  /** @deprecated */
  TxEnvelopeTempo as z_TxEnvelopeTempo,
} from 'ox/tempo'
