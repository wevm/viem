import type { Address, Errors, Hex } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { prepare as prepareTransaction } from '../../../core/actions/transaction/prepare.js'
import { send } from '../../../core/actions/transaction/send.js'
import { sendSync } from '../../../core/actions/transaction/sendSync.js'
import type { Compute, UnionOmit } from '../../../core/internal/types.js'
import * as Abis from '../../Abis.js'
import * as Addresses from '../../Addresses.js'
import type { TransactionRequest } from '../../chainConfig.js'
import {
  defineCall,
  dispatchSend,
  pickWriteParameters,
  pickWriteSyncParameters,
} from '../../internal/utils.js'
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
    /** Gas limit reserved for the withdrawal callback on the parent chain. */
    callbackGas?: bigint | undefined
    /** Optional callback data for the recipient. */
    data?: Hex.Hex | undefined
    /** Fallback address if callback fails. */
    fallbackRecipient?: Address.Address | undefined
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
      ...pickWriteParameters(options),
      ...(action === sendSync ? pickWriteSyncParameters(options) : {}),
      account,
      calls: requestWithdrawal.calls({ ...options, to }),
    })
  }

  /** Defines the calls to approve and request a withdrawal from a zone. */
  export function calls(args: Args) {
    const {
      amount,
      callbackGas = 0n,
      data = '0x',
      fallbackRecipient = args.to,
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
          callbackGas,
          fallbackRecipient,
          data,
          '0x',
        ],
      }),
    ] as const
  }

  /** Prepares a withdrawal transaction request without broadcasting it. */
  export async function prepare<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
    const options extends prepare.Options<account>,
  >(
    client: Client.Client<chain, account>,
    options: prepare.Options<account> & options,
  ): Promise<prepare.ReturnType<account, options>> {
    const {
      account = client.account,
      amount,
      callbackGas = 0n,
      data = '0x',
      fallbackRecipient,
      memo = zeroHash,
      to: to_,
      token,
    } = options
    const to = to_ ?? (account ? getAddress(account) : undefined)
    if (!to) throw new Error('`to` is required.')

    type Action = (
      client: Client.Client,
      options: object,
    ) => Promise<{
      request: PreparedWithdrawalRequest<account, options>
    }>
    // Bridges fixed Zone options to the Client chain-derived prepare signature.
    const action = prepareTransaction as unknown as Action
    const { request } = await action(client, {
      ...pickWriteParameters(options),
      account,
      calls: requestWithdrawal.calls({
        amount,
        callbackGas,
        data,
        fallbackRecipient,
        memo,
        to,
        token,
      }),
    })
    const gas: unknown = request.gas
    const feePerGas: unknown = request.maxFeePerGas ?? request.gasPrice
    if (typeof gas !== 'bigint' || typeof feePerGas !== 'bigint')
      throw new Error('Prepared transaction fee parameters are unavailable.')

    return {
      amount,
      callbackGas,
      data,
      fallbackRecipient: fallbackRecipient ?? to,
      maxFee: ceilDiv(gas * feePerGas, 1_000_000_000_000n),
      memo,
      request,
      to,
      token,
    }
  }

  export namespace prepare {
    /** Arguments for preparing a withdrawal. */
    export type Args = Omit<requestWithdrawal.Args, 'to'> & {
      /** Recipient address on the parent chain. Defaults to `account.address`. */
      to?: Address.Address | undefined
    }
    /** Options for {@link prepare}. */
    export type Options<
      account extends Account.Account | undefined = Account.Account | undefined,
    > = UnionOmit<
      ZoneWriteParameters<account>,
      'chain' | 'throwOnReceiptRevert'
    > & {
      /** Chain the transaction targets. Defaults to the Client chain. */
      chain?: Chain.Chain | undefined
    } & Args
    /** Return value for {@link prepare}. */
    export type ReturnType<
      account extends Account.Account | undefined = Account.Account | undefined,
      options extends Options<account> = Options<account>,
    > = Compute<{
      /** Amount of tokens to withdraw. */
      amount: bigint
      /** Gas limit reserved for the callback on the parent chain. */
      callbackGas: bigint
      /** Callback data for the recipient. */
      data: Hex.Hex
      /** Fallback address if the callback fails. */
      fallbackRecipient: Address.Address
      /** Maximum Zone transaction fee in fee-token base units. */
      maxFee: bigint
      /** Withdrawal memo. */
      memo: Hex.Hex
      /** Prepared Zone transaction request. */
      request: PreparedWithdrawalRequest<account, options>
      /** Recipient address on the parent chain. */
      to: Address.Address
      /** Token address to withdraw. */
      token: Address.Address
    }>
    /** Errors thrown by {@link prepare}. */
    export type ErrorType =
      | prepareTransaction.ErrorType
      | Errors.GlobalErrorType
  }
}

type WithdrawalCalls = ReturnType<typeof requestWithdrawal.calls>

type PreparedWithdrawalRequest<
  account extends Account.Account | undefined,
  options extends requestWithdrawal.prepare.Options<account>,
> = Compute<
  Omit<
    TransactionRequest,
    | keyof WithdrawalTransactionOptions<options>
    | 'calls'
    | 'chainId'
    | 'from'
    | 'gas'
    | 'gasPrice'
    | 'maxFeePerGas'
    | 'maxPriorityFeePerGas'
    | 'nonce'
    | 'type'
  > &
    WithdrawalTransactionOptions<options> &
    PreparedAccountFields<account, options> & {
      calls: WithdrawalCalls
      chainId: number
      gas: options extends { gas: infer gas extends bigint } ? gas : bigint
      gasPrice?: never
      maxFeePerGas: options extends {
        maxFeePerGas: infer maxFeePerGas extends bigint
      }
        ? maxFeePerGas
        : bigint
      maxPriorityFeePerGas: options extends {
        maxPriorityFeePerGas: infer maxPriorityFeePerGas extends bigint
      }
        ? maxPriorityFeePerGas
        : bigint
      nonce: options extends { nonce: infer nonce extends number }
        ? nonce
        : number
    }
>

type WithdrawalTransactionOptions<options> = Omit<
  options,
  keyof options &
    (
      | keyof requestWithdrawal.prepare.Args
      | 'account'
      | 'chain'
      | 'gas'
      | 'maxFeePerGas'
      | 'maxPriorityFeePerGas'
      | 'nonce'
    )
>

type ResolvedAccount<account, options> = options extends {
  account: infer account_
}
  ? account_
  : account

type PreparedAccountFields<
  account,
  options,
  resolved = ResolvedAccount<account, options>,
> = [Exclude<resolved, undefined>] extends [never]
  ? { account?: undefined; from?: Address.Address | undefined }
  : {
      account: Exclude<resolved, undefined>
      from: Address.Address
    }

function ceilDiv(numerator: bigint, denominator: bigint) {
  return (numerator + denominator - 1n) / denominator
}
