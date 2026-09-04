import { Address, type Errors, type Hex } from 'ox'
import {
  KeyAuthorization,
  MultisigOperation,
  SignatureEnvelope,
} from 'ox/tempo'
import * as CoreAccount from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import type { Compute, OneOf } from '../../../core/internal/types.js'
import {
  fromMultisig,
  resolveAccessKey,
  signKeyAuthorization,
  type MultisigAccount,
  type RootAccount,
} from '../../Account.js'
import { getConfig } from '../multisig/getConfig.js'
import { prepareAuthorization } from './prepareAuthorization.js'

/**
 * Signs a key authorization for an access key.
 *
 * Use {@link prepareAuthorization} before this action when signing requires
 * transient user activation.
 *
 * @param client - Client.
 * @param parameters - Authorization fields, or a stored operation hash.
 * @returns A signed key authorization with multisig operation metadata when coordinated.
 */
export function signAuthorization<
  chain extends Chain.Chain | undefined,
  account extends CoreAccount.Account | undefined,
>(
  client: Client.Client<chain, account>,
  parameters: signAuthorization.CoordinatedOptions,
): Promise<signAuthorization.CoordinatedReturnType>
export function signAuthorization<
  chain extends Chain.Chain | undefined,
  account extends CoreAccount.Account | undefined,
>(
  client: Client.Client<chain, account>,
  parameters: signAuthorization.LocalOptions<account>,
): Promise<signAuthorization.ReturnType>
export async function signAuthorization<
  chain extends Chain.Chain | undefined,
  account extends CoreAccount.Account | undefined,
>(
  client: Client.Client<chain, account>,
  parameters: signAuthorization.Options<account>,
): Promise<
  signAuthorization.CoordinatedReturnType | signAuthorization.ReturnType
> {
  const coordinated =
    ('hash' in parameters && parameters.hash) ||
    ('owner' in parameters && parameters.owner)

  if (coordinated) {
    const parameters_ = parameters as signAuthorization.CoordinatedOptions
    const owner_ = parameters_.owner
    if (!owner_ || typeof owner_ === 'string')
      throw new Error(
        'A local owner account is required to approve a multisig key authorization.',
      )
    const owner = owner_
    const sign = owner.sign
    if (!sign)
      throw new Error(
        'A local owner account is required to approve a multisig key authorization.',
      )

    const request = await (async () => {
      if ('hash' in parameters_ && parameters_.hash) {
        const signature = SignatureEnvelope.serialize(
          SignatureEnvelope.from(await sign({ hash: parameters_.hash })),
        )
        return { hash: parameters_.hash, signature }
      }

      const {
        account: account_,
        owner: _,
        ...authorization
      } = parameters_ as signAuthorization.CoordinatedInitialOptions
      const address = typeof account_ === 'string' ? account_ : account_.address
      const config = await (async () => {
        if (typeof account_ !== 'string' && account_.config)
          return account_.config
        const config = await getConfig(client, { address })
        if (config) return config
        throw new Error(
          `No current multisig config is cached for account ${address}. Provide the current config.`,
        )
      })()
      const account = (() => {
        if (config.version !== 0n) return fromMultisig({ address, ...config })
        const { version: _, ...initialConfig } = config
        return fromMultisig({ address: 'infer', ...initialConfig })
      })()
      if (!Address.isEqual(account.address, address))
        throw new Error('Initial multisig config does not match the account.')
      const prepared = await prepareAuthorization(client, {
        ...authorization,
        account,
      })
      const signature = SignatureEnvelope.serialize(
        SignatureEnvelope.from(await sign({ hash: prepared.signPayload })),
      )
      const { accessKey, admin, chainId, expiry, limits, scopes, witness } =
        prepared
      const { accessKeyAddress, keyType: type } = resolveAccessKey(accessKey)
      const keyAuthorization = KeyAuthorization.from({
        account: account.address,
        address: accessKeyAddress,
        chainId: BigInt(chainId),
        signature: SignatureEnvelope.from({
          account: account.address,
          config,
          signatures: [SignatureEnvelope.from(signature)],
        }),
        type,
        ...(witness ? { witness } : {}),
        ...(admin ? { isAdmin: true } : { expiry, limits, scopes }),
      } as KeyAuthorization.Signed)
      return { keyAuthorization: KeyAuthorization.toRpc(keyAuthorization) }
    })()

    const operation = await client.request({
      method: 'multisig_approveKeyAuthorization',
      params: [request],
    })
    const multisig = MultisigOperation.fromRpc(
      operation as MultisigOperation.KeyAuthorizationRpc,
    )
    const keyAuthorization = KeyAuthorization.deserialize(
      await (async () => {
        if (multisig.status === 'success') return multisig.keyAuthorization
        const approvals = await MultisigOperation.selectApprovals({
          account: multisig.account,
          approvals: multisig.approvals,
          config: multisig.config,
          hash: multisig.hash,
        })
        return MultisigOperation.serializeKeyAuthorization(
          multisig.keyAuthorization,
          {
            account: multisig.account,
            approvals:
              approvals.selectedApprovals.length > 0
                ? approvals.selectedApprovals
                : approvals.approvals.slice(0, 1),
            config: multisig.config,
          },
        )
      })(),
    )
    if (!keyAuthorization.signature)
      throw new Error('Expected a signed multisig key authorization.')
    return {
      ...keyAuthorization,
      hash: multisig.hash,
      multisig,
      status: multisig.status,
    } as signAuthorization.CoordinatedReturnType
  }

  const prepared = (
    'signPayload' in parameters
      ? parameters
      : await prepareAuthorization(
          client,
          parameters as signAuthorization.LocalOptions<account>,
        )
  ) as prepareAuthorization.ReturnType
  const {
    accessKey,
    account: account_,
    chainId,
    multisig: multisigState,
    signPayload: _,
    ...rest
  } = prepared
  return signKeyAuthorization(account_ as CoreAccount.Local, {
    chainId: BigInt(chainId),
    key: accessKey,
    multisig: multisigState,
    ...rest,
  })
}

export namespace signAuthorization {
  /** Initial coordinated key authorization parameters. */
  export type CoordinatedInitialOptions = Omit<
    prepareAuthorization.Options<CoreAccount.Account>,
    'account' | 'multisig'
  > & {
    /** Multisig account being authorized. */
    account: Address.Address | MultisigAccount
    /** Local owner that approves the authorization. */
    owner: RootAccount | MultisigAccount
  }

  /** Coordinated key authorization parameters. */
  export type CoordinatedOptions = OneOf<
    | CoordinatedInitialOptions
    | {
        /** Stored multisig operation hash. */
        hash: Hex.Hex
        /** Local owner that approves the authorization. */
        owner: RootAccount | MultisigAccount
      }
  >

  /** Locally signed key authorization parameters. */
  export type LocalOptions<
    account extends CoreAccount.Account | undefined =
      | CoreAccount.Account
      | undefined,
  > = prepareAuthorization.Options<account> & {
    /** Serialized approvals from external multisig owners. */
    signatures?: readonly SignatureEnvelope.Serialized[] | undefined
  }

  /** Parameters for {@link signAuthorization}. */
  export type Options<
    account extends CoreAccount.Account | undefined =
      | CoreAccount.Account
      | undefined,
  > = CoordinatedOptions | LocalOptions<account>

  /** Local return value for {@link signAuthorization}. */
  export type ReturnType = KeyAuthorization.Signed

  /** Coordinated return value for {@link signAuthorization}. */
  export type CoordinatedReturnType = Compute<
    ReturnType & {
      /** Deterministic multisig operation hash. */
      hash: Hex.Hex
      /** Current multisig operation. */
      multisig: MultisigOperation.KeyAuthorizationOperation
      /** Current multisig operation status. */
      status: MultisigOperation.KeyAuthorizationOperation['status']
    }
  >

  /** Error type for {@link signAuthorization}. */
  export type ErrorType = Errors.GlobalErrorType
}
