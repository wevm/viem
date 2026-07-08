import type { Address, Errors, Hex } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { send } from '../../../core/actions/transaction/send.js'
import type { sendSync } from '../../../core/actions/transaction/sendSync.js'
import * as Abis from '../../Abis.js'
import * as Addresses from '../../Addresses.js'
import { defineCall, dispatchSend } from '../../internal/utils.js'
import * as ZoneAbis from '../../zones/Abis.js'
import { getAccount, getAddress, type ZoneWriteParameters } from './internal.js'

const zeroHash =
  '0x0000000000000000000000000000000000000000000000000000000000000000'

/**
 * Requests a withdrawal from a zone to the parent Tempo chain via the ZoneOutbox contract.
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
 * const hash = await Actions.zone.requestWithdrawal(client, {
 *   amount: 100n,
 *   token: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function requestWithdrawal<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: requestWithdrawal.Options<account>,
): Promise<requestWithdrawal.ReturnType> {
  return requestWithdrawal.inner(send, client, options)
}

export namespace requestWithdrawal {
  export type Args = {
    /** Amount of tokens to withdraw. */
    amount: bigint
    /** Optional callback data for the recipient. */
    data?: Hex.Hex | undefined
    /** Fallback address if callback fails. */
    fallbackRecipient?: Address.Address | undefined
    /** Gas limit reserved for the withdrawal callback on the parent chain. */
    gas?: bigint | undefined
    /** Optional withdrawal memo. */
    memo?: Hex.Hex | undefined
    /** Recipient address on the parent Tempo chain. */
    to: Address.Address
    /** Token address to withdraw. */
    token: Address.Address
  }
  export type Options<
    account extends Account.Account | undefined = Account.Account | undefined,
  > = ZoneWriteParameters<account> &
    Omit<Args, 'to'> & {
      /** Recipient address on the parent Tempo chain. Defaults to `account.address`. */
      to?: Address.Address | undefined
    }
  export type ReturnType = send.ReturnType
  export type ErrorType = Errors.GlobalErrorType

  /** @internal */
  export async function inner<
    action extends typeof send | typeof sendSync,
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    action: action,
    client: Client.Client<chain, account>,
    options: Options<account>,
  ): Promise<dispatchSend.ReturnType<action>> {
    const account = getAccount(options.account ?? client.account)
    const to = options.to ?? getAddress(account)
    return dispatchSend(action, client, {
      ...options,
      account,
      calls: requestWithdrawal.calls({ ...options, to }),
    })
  }

  /** Defines the calls to approve and request a withdrawal from a zone. */
  export function calls(args: Args) {
    const {
      amount,
      data = '0x',
      fallbackRecipient = args.to,
      gas = 0n,
      memo = zeroHash,
      to,
      token,
    } = args
    return [
      defineCall({
        address: token,
        abi: Abis.tip20,
        functionName: 'approve',
        args: [Addresses.zoneOutbox, amount],
      }),
      defineCall({
        address: Addresses.zoneOutbox,
        abi: ZoneAbis.zoneOutbox,
        functionName: 'requestWithdrawal',
        args: [
          token,
          to,
          amount,
          memo,
          gas,
          fallbackRecipient,
          data,
          '0x',
        ],
      }),
    ] as const
  }
}
