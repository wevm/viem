import * as AbiEvent from 'ox/AbiEvent'
import * as AbiFunction from 'ox/AbiFunction'
import type * as Address from 'ox/Address'
import type * as Errors from 'ox/Errors'
import type * as Hex from 'ox/Hex'
import type * as Log from 'ox/Log'
import * as TokenRole from 'ox/tempo/TokenRole'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { send } from '../../../core/actions/transaction/send.js'
import type { sendSync } from '../../../core/actions/transaction/sendSync.js'
import * as Abis from '../../Abis.js'
import type { TokenParameter, WriteParameters } from '../../internal/types.js'
import {
  type CallParameters,
  defineCall,
  pickWriteParameters,
  resolveCallParameters,
  resolveToken,
} from '../../internal/utils.js'

/**
 * Renounces roles for a TIP-20 token.
 *
 * @example
 * ```ts
 * import { Account, Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({
 *   account: Account.fromSecp256k1('0x…'),
 *   transport: http(),
 * })
 *
 * const hash = await Actions.token.renounceRoles(client, {
 *   roles: ['issuer'],
 *   token: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function renounceRoles<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: renounceRoles.Options,
): Promise<renounceRoles.ReturnType> {
  return renounceRoles.inner(send, client, options)
}

export namespace renounceRoles {
  export type Args = {
    /** Role to renounce. */
    role: TokenRole.TokenRole
  } & TokenParameter
  export type Options = WriteParameters &
    Omit<Args, 'role'> & {
      /** Roles to renounce. */
      roles: readonly TokenRole.TokenRole[]
    }
  export type ReturnType = send.ReturnType
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType

  /** @internal */
  export async function inner<
    action extends typeof send | typeof sendSync,
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    action: action,
    client: Client.Client<chain, account>,
    options: Options,
  ): Promise<ActionReturnType<action>> {
    return (await action(client, {
      ...pickWriteParameters(options as never),
      calls: options.roles.map((role) => {
        const call = renounceRoles.call(client, { ...options, role })
        return {
          data: AbiFunction.encodeData(
            AbiFunction.fromAbi(call.abi, call.functionName, {
              args: call.args,
            } as never),
            call.args,
          ),
          to: call.address,
        }
      }),
    } as never)) as never
  }

  /**
   * Defines a call to the `renounceRole` function.
   *
   * @param parameters - Client (optional), followed by the call arguments.
   * @returns The call.
   */
  export function call<chain extends Chain.Chain | undefined>(
    ...parameters: CallParameters<Args, Client.Client<chain>>
  ) {
    const [client, args] = resolveCallParameters(parameters)
    const { role, token } = args
    return defineCall({
      abi: Abis.tip20,
      address: resolveToken(client, { token }).address,
      args: [TokenRole.serialize(role)],
      functionName: 'renounceRole',
    })
  }

  /**
   * Extracts the `RoleMembershipUpdated` events from logs.
   *
   * @param logs - The logs.
   * @returns The `RoleMembershipUpdated` events.
   */
  export function extractEvents(logs: readonly Log.Log[]) {
    const events = AbiEvent.extractLogs(Abis.tip20, logs, {
      eventName: 'RoleMembershipUpdated',
      strict: true,
    })
    if (events.length === 0)
      throw new Error('`RoleMembershipUpdated` events not found.')
    return events
  }
}

type ActionReturnType<action> = action extends typeof sendSync
  ? sendSync.ReturnType
  : send.ReturnType

export type RoleMembershipUpdated = {
  /** Role whose membership changed. */
  role: Hex.Hex
  /** Account whose role membership changed. */
  account: Address.Address
  /** Sender that changed role membership. */
  sender: Address.Address
  /** Whether the account has the role after the update. */
  hasRole: boolean
}
