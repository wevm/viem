import type { Address, Errors } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { write } from '../../../core/actions/contract/write.js'
import * as Withdrawal from '../../Withdrawal.js'
import { l2ToL1MessagePasserAbi } from '../../abis.js'
import { contracts } from '../../contracts.js'

/** Initiates a withdrawal from L2 to L1. */
export async function initiateWithdrawal<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: initiateWithdrawal.Options<chain, account>,
): Promise<initiateWithdrawal.ReturnType> {
  const { gas: gas_, request, ...rest } = options
  const { data = '0x', gas, to, value } = request
  return write(client, {
    ...rest,
    abi: l2ToL1MessagePasserAbi,
    address: contracts.l2ToL1MessagePasser.address,
    args: [to, gas, data],
    functionName: 'initiateWithdrawal',
    gas: gas_ ?? undefined,
    value,
  } as write.Options<
    typeof l2ToL1MessagePasserAbi,
    'initiateWithdrawal',
    readonly [typeof to, bigint, typeof data],
    chain
  >)
}

export declare namespace initiateWithdrawal {
  /** Options for {@link initiateWithdrawal}. */
  type Options<
    chain extends Chain.Chain | undefined = Chain.Chain | undefined,
    account extends Account.Account | undefined = Account.Account | undefined,
  > = Omit<
    write.Options<
      typeof l2ToL1MessagePasserAbi,
      'initiateWithdrawal',
      readonly [
        Withdrawal.Request['to'],
        bigint,
        NonNullable<Withdrawal.Request['data']>,
      ],
      chain
    >,
    | 'abi'
    | 'account'
    | 'address'
    | 'args'
    | 'functionName'
    | 'gas'
    | 'to'
    | 'value'
  > &
    (account extends Account.Account
      ? { account?: Account.Account | Address.Address | undefined }
      : { account: Account.Account | Address.Address }) & {
      /** L2 execution gas limit. Pass `null` to defer estimation to the signer. */
      gas?: bigint | null | undefined
      /** Withdrawal request passed to the message passer contract. */
      request: Withdrawal.Request
    }

  /** Return type of {@link initiateWithdrawal}. */
  type ReturnType = write.ReturnType

  /** Errors thrown by {@link initiateWithdrawal}. */
  type ErrorType = write.ErrorType | Errors.GlobalErrorType
}
