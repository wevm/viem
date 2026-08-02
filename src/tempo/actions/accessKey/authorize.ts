import { AbiEvent } from 'ox'
import type { Errors, Log } from 'ox'

import * as CoreAccount from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { send } from '../../../core/actions/transaction/send.js'
import type { sendSync } from '../../../core/actions/transaction/sendSync.js'
import * as Abis from '../../Abis.js'
import * as Account from '../../Account.js'
import type { WriteParameters } from '../../internal/types.js'
import { dispatchSend } from '../../internal/utils.js'

/**
 * Authorizes an access key by signing a key authorization and sending a transaction.
 *
 * @example
 * ```ts
 * import { P256 } from 'viem/utils'
 * import { Account, Actions, Client, http } from 'viem/tempo'
 *
 * const account = Account.fromSecp256k1('0x…')
 * const client = Client.create({
 *   account,
 *   transport: http(),
 * })
 *
 * const accessKey = Account.fromP256(P256.randomPrivateKey(), {
 *   access: account,
 * })
 *
 * const hash = await Actions.accessKey.authorize(client, {
 *   accessKey,
 *   expiry: Math.floor((Date.now() + 30_000) / 1000),
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function authorize<
  chain extends Chain.Chain | undefined,
  account extends CoreAccount.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: authorize.Options,
): Promise<authorize.ReturnType> {
  return authorize.inner(send, client, options)
}

export namespace authorize {
  export type Args = Pick<
    Account.signKeyAuthorization.Parameters,
    'admin' | 'expiry' | 'limits' | 'scopes' | 'witness'
  > & {
    /** Access key to authorize. */
    accessKey: Account.resolveAccessKey.Parameters
    /** Chain ID for replay protection. @default client.chain.id */
    chainId?: number | bigint | undefined
  }
  export type Options = Omit<WriteParameters, 'keyAuthorization'> & Args
  export type ReturnType = send.ReturnType
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType

  /** @internal */
  export async function inner<
    action extends typeof send | typeof sendSync,
    chain extends Chain.Chain | undefined,
    account extends CoreAccount.Account | undefined,
  >(
    action: action,
    client: Client.Client<chain, account>,
    options: Options,
  ): Promise<dispatchSend.ReturnType<action>> {
    const {
      accessKey,
      admin,
      chainId = client.chain?.id,
      expiry,
      limits,
      scopes,
      witness,
      ...rest
    } = options
    const account = rest.account ?? client.account
    if (!account) throw new CoreAccount.NotFoundError()
    if (typeof account === 'string')
      throw new Error('account signing is required.')
    if (chainId === undefined) throw new Error('chainId is required.')
    const keyAuthorization = await Account.signKeyAuthorization(
      account as CoreAccount.Local,
      { admin, chainId, expiry, key: accessKey, limits, scopes, witness },
    )
    return dispatchSend(action, client, {
      ...rest,
      account,
      keyAuthorization,
    })
  }

  /** Extracts the `KeyAuthorized` event from logs. */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.accountKeychain, logs, {
      eventName: 'KeyAuthorized',
      strict: true,
    })
    if (!log) throw new Error('`KeyAuthorized` event not found.')
    return log
  }
}
