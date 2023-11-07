import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import {
  type EstimateL1GasParameters,
  type EstimateL1GasReturnType,
  estimateL1Gas,
} from '../actions/estimateL1Gas.js'
import {
  type EstimateTotalGasParameters,
  type EstimateTotalGasReturnType,
  estimateTotalGas,
} from '../actions/estimateTotalGas.js'

export type PublicOpStackActions<
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
> = {
  /**
   * Estimates the amount of L1 gas required to execute an L2 transaction.
   *
   * @param client - Client to use
   * @param parameters - {@link EstimateL1GasParameters}
   * @returns The gas estimate. {@link EstimateL1GasReturnType}
   *
   * @example
   * import { createPublicClient, http, parseEther } from 'viem'
   * import { optimism } from 'viem/chains'
   *
   * const client = createPublicClient({
   *   chain: optimism,
   *   transport: http(),
   * })
   * const l1Gas = await client.estimateL1Gas({
   *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
   *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
   *   value: parseEther('1'),
   * })
   */
  estimateL1Gas: (
    parameters: EstimateL1GasParameters<chain, account>,
  ) => Promise<EstimateL1GasReturnType>
  /**
   * Estimates the total amount of combined L1 + L2 gas required to execute an L2 transaction.
   *
   * @param client - Client to use
   * @param parameters - {@link EstimateL1GasParameters}
   * @returns The gas estimate. {@link EstimateL1GasReturnType}
   *
   * @example
   * import { createPublicClient, http, parseEther } from 'viem'
   * import { optimism } from 'viem/chains'
   *
   * const client = createPublicClient({
   *   chain: optimism,
   *   transport: http(),
   * })
   * const totalGas = await client.estimateTotalGas({
   *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
   *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
   *   value: parseEther('1'),
   * })
   */
  estimateTotalGas: (
    parameters: EstimateTotalGasParameters<chain, account>,
  ) => Promise<EstimateTotalGasReturnType>
}

export function publicOpStackActions<
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
>(
  client: Client<Transport, TChain, TAccount>,
): PublicOpStackActions<TChain, TAccount> {
  return {
    estimateL1Gas: (args) => estimateL1Gas(client, args),
    estimateTotalGas: (args) => estimateTotalGas(client, args),
  }
}
