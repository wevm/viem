import type { Errors } from 'ox'
import { AbiEvent } from 'ox'
import { AccountConfig } from 'ox/tempo'
import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { write } from '../../../core/actions/contract/write.js'
import type { writeSync } from '../../../core/actions/contract/writeSync.js'
import * as Abis from '../../Abis.js'
import * as Addresses from '../../Addresses.js'
import type * as TempoErrors from '../../errors.js'
import type { WriteParameters } from '../../internal/types.js'
import { defineCall, dispatchWrite } from '../../internal/utils.js'

/**
 * Upgrades an existing account to a configurable account in place
 * ([TIP-1113](https://tips.sh/1113)).
 *
 * The account's root key must sign the upgrade, and the transaction may carry
 * a key authorization but no authorization list. To batch the upgrade with
 * other calls, send `upgrade.call` in `calls` instead. After the upgrade, the
 * root key can no longer sign for the account.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempoLocalnet } from 'viem/chains'
 * import { Account, Actions } from 'viem/tempo'
 *
 * const root = Account.fromSecp256k1('0x...')
 * const client = Client.create({
 *   chain: tempoLocalnet,
 *   transport: http(),
 * })
 *
 * const hash = await Actions.accounts.upgrade(client, {
 *   account: root,
 *   owners: [{ owner: '0x...', weight: 1 }],
 *   threshold: 1,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function upgrade<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  parameters: upgrade.Options,
): Promise<upgrade.ReturnType> {
  return upgrade.inner(write, client, parameters)
}

export namespace upgrade {
  export type Options = Omit<WriteParameters, 'owner'> & Args

  export type Args = Pick<AccountConfig.Config, 'owners' | 'threshold'>

  export type ReturnType = write.ReturnType

  // TODO: exhaustive error type
  export type ErrorType =
    | TempoErrors.ExecutionErrorType
    | Errors.GlobalErrorType

  /** @internal */
  export async function inner<
    action extends typeof write | typeof writeSync,
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    action: action,
    client: Client.Client<chain, account>,
    parameters: Options,
  ): Promise<dispatchWrite.ReturnType<action>> {
    const { owners, threshold, ...rest } = parameters
    if ((rest as Record<string, unknown>).authorizationList !== undefined)
      throw new Error(
        '`authorizationList` is not supported: an upgrade transaction cannot carry an authorization list.',
      )
    for (const key of ['calls', 'data', 'to'])
      if ((rest as Record<string, unknown>)[key] !== undefined)
        throw new Error(
          `\`${key}\` is not supported: send \`upgrade.call\` in \`calls\` to batch the upgrade with other calls.`,
        )
    const account = rest.account ?? client.account
    if (typeof account === 'object' && 'source' in account) {
      if (account.source === 'configurable')
        throw new Error('The account is already a configurable account.')
      if (account.source === 'accessKey')
        throw new Error(
          'The root key must sign the upgrade, not an access key.',
        )
    }
    // Always send a Tempo envelope, so relays recognize and cache the upgrade.
    return dispatchWrite(action, client, {
      ...rest,
      ...upgrade.call({ owners, threshold }),
      type: 'tempo',
    })
  }

  /**
   * Defines a call to the `upgradeAccount` function.
   *
   * The call may sit anywhere in a batch, as a top-level call in a
   * transaction signed by the account's root key without an authorization
   * list. Later calls in the batch run against the upgraded account.
   *
   * @example
   * ```ts
   * import { Actions } from 'viem/tempo'
   *
   * const call = Actions.accounts.upgrade.call({
   *   owners: [{ owner: '0x...', weight: 1 }],
   *   threshold: 1,
   * })
   * ```
   *
   * @param args - Owners and threshold to install.
   * @returns The call.
   */
  export function call(args: Args) {
    const { owners, threshold } = AccountConfig.from(args)
    return defineCall({
      address: Addresses.configurableAccount,
      abi: Abis.configurableAccount,
      args: [threshold, owners],
      functionName: 'upgradeAccount',
    })
  }

  /**
   * Extracts the `AccountUpgraded` event from logs.
   *
   * @param logs - Transaction logs.
   * @returns The account upgrade event.
   */
  export function extractEvent(logs: readonly AbiEvent.extractLogs.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.configurableAccount, logs, {
      eventName: 'AccountUpgraded',
      strict: true,
    })
    if (!log) throw new Error('`AccountUpgraded` event not found.')
    return log
  }
}
