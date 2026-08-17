import type { Errors, Hex } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { send } from '../../../core/actions/transaction/send.js'
import { sendSync } from '../../../core/actions/transaction/sendSync.js'
import * as Abis from '../../Abis.js'
import * as Addresses from '../../Addresses.js'
import {
  defineCall,
  dispatchSend,
  pickWriteParameters,
  pickWriteSyncParameters,
} from '../../internal/utils.js'
import * as ZoneAbis from '../../zones/Abis.js'
import { getAccount, getAddress, type ZoneWriteParameters } from './internal.js'
import type { requestWithdrawal } from './requestWithdrawal.js'

const zeroHash =
  '0x0000000000000000000000000000000000000000000000000000000000000000'
const defaultGas = 10_000_000n

/**
 * Requests a verifiable withdrawal from a zone to the parent Tempo chain via the ZoneOutbox contract.
 *
 * Includes a `revealTo` public key so the sequencer can encrypt the withdrawal details.
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
 * const hash = await Actions.zone.requestVerifiableWithdrawal(client, {
 *   amount: 100n,
 *   revealTo: '0x02…',
 *   token: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function requestVerifiableWithdrawal<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: requestVerifiableWithdrawal.Options<account>,
): Promise<requestVerifiableWithdrawal.ReturnType> {
  return requestVerifiableWithdrawal.inner(send, client, options)
}

export namespace requestVerifiableWithdrawal {
  export type Args = requestWithdrawal.Args & {
    /** Compressed secp256k1 public key for encrypted reveal. */
    revealTo: Hex.Hex
  }
  export type Options<
    account extends Account.Account | undefined = Account.Account | undefined,
  > = ZoneWriteParameters<account> &
    Omit<Args, 'to'> & {
      /** Recipient address on the parent Tempo chain. Defaults to `account.address`. */
      to?: Args['to'] | undefined
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
      ...pickWriteParameters(options),
      ...(action === sendSync ? pickWriteSyncParameters(options) : {}),
      account,
      calls: requestVerifiableWithdrawal.calls({ ...options, to }),
      gas: options.gas ?? defaultGas,
    })
  }

  /** Defines the calls to approve and request a verifiable withdrawal from a zone. */
  export function calls(args: Args) {
    const {
      amount,
      callbackGas = 0n,
      data = '0x',
      fallbackRecipient = args.to,
      memo = zeroHash,
      revealTo,
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
          callbackGas,
          fallbackRecipient,
          data,
          revealTo,
        ],
      }),
    ] as const
  }
}
