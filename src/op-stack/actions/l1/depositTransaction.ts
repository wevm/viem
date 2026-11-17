import type { Errors } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { write } from '../../../core/actions/contract/write.js'
import type * as Deposit from '../../Deposit.js'
import { portalAbi } from '../../abis.js'
import {
  type ContractParameters,
  type WriteParameters,
  getContractAddress,
  zeroAddress,
} from './internal.js'

/** Deposits an L1 transaction onto an OP Stack L2. */
export async function depositTransaction<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: depositTransaction.Options<account>,
): Promise<depositTransaction.ReturnType> {
  const {
    account = client.account,
    chain = client.chain,
    gas,
    maxFeePerGas,
    maxPriorityFeePerGas,
    nonce,
    request: {
      data = '0x',
      gas: l2Gas,
      isCreation = false,
      mint,
      to = zeroAddress,
      value,
    },
  } = options

  return write(client as Client.Client, {
    account,
    abi: portalAbi,
    address: getContractAddress({ ...options, chain }, 'portal'),
    args: [
      isCreation ? zeroAddress : to,
      value ?? mint ?? 0n,
      l2Gas,
      isCreation,
      data,
    ],
    chain,
    functionName: 'depositTransaction',
    gas: gas ?? undefined,
    maxFeePerGas,
    maxPriorityFeePerGas,
    nonce,
    value: mint,
  })
}

export declare namespace depositTransaction {
  /** Options for {@link depositTransaction}. */
  type Options<
    account extends Account.Account | undefined = Account.Account | undefined,
  > = ContractParameters<'portal'> &
    WriteParameters<account> & {
      /** L2 transaction request. */
      request: Deposit.Request
    }

  /** Return type of {@link depositTransaction}. */
  type ReturnType = write.ReturnType

  /** Errors thrown by {@link depositTransaction}. */
  type ErrorType =
    | write.ErrorType
    | Chain.getContractAddress.ErrorType
    | Errors.GlobalErrorType
}
