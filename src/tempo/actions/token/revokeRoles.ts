import { AbiEvent, AbiFunction } from 'ox'
import type { Address, Errors, Hex, Log } from 'ox'
import { TokenRole } from 'ox/tempo'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { send } from '../../../core/actions/transaction/send.js'
import { sendSync } from '../../../core/actions/transaction/sendSync.js'
import * as Abis from '../../Abis.js'
import type { TokenParameter, WriteParameters } from '../../internal/types.js'
import {
  type CallParameters,
  defineCall,
  dispatchSend,
  pickWriteParameters,
  pickWriteSyncParameters,
  resolveCallParameters,
  resolveToken,
} from '../../internal/utils.js'

/**
 * Revokes roles for a TIP-20 token.
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
 * const hash = await Actions.token.revokeRoles(client, {
 *   roles: ['issuer'],
 *   from: '0x…',
 *   token: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function revokeRoles<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: revokeRoles.Options,
): Promise<revokeRoles.ReturnType> {
  return revokeRoles.inner(send, client, options)
}

export namespace revokeRoles {
  export type Args = {
    /** Role to revoke. */
    role: TokenRole.TokenRole
    /** Address to revoke the role from. */
    from: Address.Address
  } & TokenParameter
  export type Options = WriteParameters &
    Omit<Args, 'role'> & {
      /** Roles to revoke. */
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
  ): Promise<dispatchSend.ReturnType<action>> {
    return dispatchSend(action, client, {
      ...pickWriteParameters(options),
      ...(action === sendSync ? pickWriteSyncParameters(options) : {}),
      calls: options.roles.map((role) => {
        const call = revokeRoles.call(client, { ...options, role })
        return {
          data: AbiFunction.encodeData(
            AbiFunction.fromAbi(call.abi, call.functionName, {
              args: call.args,
            }),
            call.args,
          ),
          to: call.address,
        }
      }),
    })
  }

  /**
   * Defines a call to the `revokeRole` function.
   *
   * @param parameters - Client (optional), followed by the call arguments.
   * @returns The call.
   */
  export function call<chain extends Chain.Chain | undefined>(
    ...parameters: CallParameters<Args, Client.Client<chain>>
  ) {
    const [client, args] = resolveCallParameters(parameters)
    const { from, role, token } = args
    return defineCall({
      abi: Abis.tip20,
      address: resolveToken(client, { token }).address,
      args: [TokenRole.serialize(role), from],
      functionName: 'revokeRole',
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
