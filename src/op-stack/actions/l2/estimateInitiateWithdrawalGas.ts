import type { Errors } from 'ox'

import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { estimateGas } from '../../../core/actions/contract/estimateGas.js'
import * as Withdrawal from '../../Withdrawal.js'
import { l2ToL1MessagePasserAbi } from '../../abis.js'
import { contracts } from '../../contracts.js'

/** Estimates gas required to initiate a withdrawal from L2 to L1. */
export async function estimateInitiateWithdrawalGas<
  chain extends Chain.Chain | undefined,
>(
  client: Client.Client<chain>,
  options: estimateInitiateWithdrawalGas.Options<chain>,
): Promise<estimateInitiateWithdrawalGas.ReturnType> {
  const { chain: _, request, ...rest } = options
  const { data = '0x', gas, to, value } = request
  return estimateGas(client, {
    ...rest,
    abi: l2ToL1MessagePasserAbi,
    address: contracts.l2ToL1MessagePasser.address,
    args: [to, gas, data],
    functionName: 'initiateWithdrawal',
    value,
  })
}

export declare namespace estimateInitiateWithdrawalGas {
  /** Options for {@link estimateInitiateWithdrawalGas}. */
  type Options<
    _chain extends Chain.Chain | undefined = Chain.Chain | undefined,
  > = Omit<
    estimateGas.Options<
      typeof l2ToL1MessagePasserAbi,
      'initiateWithdrawal',
      readonly [
        Withdrawal.Request['to'],
        bigint,
        NonNullable<Withdrawal.Request['data']>,
      ]
    >,
    'abi' | 'address' | 'args' | 'functionName' | 'to' | 'value'
  > & {
    /** L2 chain containing the message passer contract. @default client.chain */
    chain?: Chain.Chain | null | undefined
    /** Withdrawal request passed to the message passer contract. */
    request: Withdrawal.Request
  }

  /** Return type of {@link estimateInitiateWithdrawalGas}. */
  type ReturnType = bigint

  /** Errors thrown by {@link estimateInitiateWithdrawalGas}. */
  type ErrorType = estimateGas.ErrorType | Errors.GlobalErrorType
}
