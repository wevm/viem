import type { Address, Errors, Hex } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { send } from '../../../core/actions/transaction/send.js'
import type { sendSync } from '../../../core/actions/transaction/sendSync.js'
import * as Abis from '../../Abis.js'
import { defineCall, dispatchSend } from '../../internal/utils.js'
import * as ZoneAbis from '../../zones/Abis.js'
import { getPortalAddress } from '../../zones/zone.js'
import { getAccount, getAddress, getChain, type ZoneWriteParameters } from './internal.js'

const zeroHash =
  '0x0000000000000000000000000000000000000000000000000000000000000000'

/**
 * Deposits tokens into a zone on the parent Tempo chain.
 *
 * Batches approve and deposit into a single transaction.
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
 * const hash = await Actions.zone.deposit(client, {
 *   amount: 100n,
 *   token: '0x20c0000000000000000000000000000000000001',
 *   zoneId: 7,
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function deposit<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: deposit.Options<account>,
): Promise<deposit.ReturnType> {
  return deposit.inner(send, client, options)
}

export namespace deposit {
  export type Args = {
    /** Amount of tokens to deposit. */
    amount: bigint
    /** Parent chain ID. */
    chainId: number
    /** Optional deposit memo. */
    memo?: Hex.Hex | undefined
    /** Recipient address in the zone. */
    recipient: Address.Address
    /** Token address to deposit. */
    token: Address.Address
    /** Zone ID. */
    zoneId: number
  }
  export type Options<
    account extends Account.Account | undefined = Account.Account | undefined,
  > = ZoneWriteParameters<account> &
    Omit<Args, 'chainId' | 'recipient'> & {
      /** Recipient address in the zone. Defaults to `account.address`. */
      recipient?: Address.Address | undefined
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
    const chain = getChain(client, options)
    const account = getAccount(options.account ?? client.account)
    const recipient = options.recipient ?? getAddress(account)
    return dispatchSend(action, client, {
      ...options,
      account,
      calls: deposit.calls({ ...options, chainId: chain.id, recipient }),
    })
  }

  /** Defines the calls to approve and deposit tokens into a zone. */
  export function calls(args: Args) {
    const { amount, chainId, memo = zeroHash, recipient, token, zoneId } = args
    const portalAddress = getPortalAddress(chainId, zoneId)
    return [
      defineCall({
        address: token,
        abi: Abis.tip20,
        functionName: 'approve',
        args: [portalAddress, amount],
      }),
      defineCall({
        address: portalAddress,
        abi: ZoneAbis.zonePortal,
        functionName: 'deposit',
        args: [token, recipient, amount, memo],
      }),
    ] as const
  }
}
