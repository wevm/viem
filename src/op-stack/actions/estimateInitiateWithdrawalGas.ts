import type { Address } from 'abitype'
import {
  type EstimateContractGasErrorType,
  type EstimateContractGasParameters,
  estimateContractGas,
} from '../../actions/public/estimateContractGas.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Account, GetAccountParameter } from '../../types/account.js'
import type {
  Chain,
  DeriveChain,
  GetChainParameter,
} from '../../types/chain.js'
import type { UnionEvaluate, UnionOmit } from '../../types/utils.js'
import type { FormattedTransactionRequest } from '../../utils/formatters/transactionRequest.js'
import { l2ToL1MessagePasserAbi } from '../abis.js'
import { contracts } from '../contracts.js'
import type { WithdrawalRequest } from '../types/withdrawal.js'

export type EstimateInitiateWithdrawalGasParameters<
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
  _derivedChain extends Chain | undefined = DeriveChain<chain, chainOverride>,
> = UnionEvaluate<
  UnionOmit<
    FormattedTransactionRequest<_derivedChain>,
    | 'accessList'
    | 'data'
    | 'from'
    | 'gas'
    | 'gasPrice'
    | 'to'
    | 'type'
    | 'value'
  >
> &
  GetAccountParameter<account, Account | Address> &
  GetChainParameter<chain, chainOverride> & {
    /** Gas limit for transaction execution on the L2. */
    gas?: bigint | undefined
    /**
     * Withdrawal request.
     * Supplied to the L2ToL1MessagePasser `initiateWithdrawal` method.
     */
    request: WithdrawalRequest
  }
export type EstimateInitiateWithdrawalGasReturnType = bigint
export type EstimateInitiateWithdrawalGasErrorType =
  | EstimateContractGasErrorType
  | ErrorType

/**
 * Estimates gas required to initiate a [withdrawal](https://community.optimism.io/docs/protocol/withdrawal-flow/#withdrawal-initiating-transaction) on an L2 to the L1.
 *
 * - Docs: https://viem.sh/op-stack/actions/estimateInitiateWithdrawalGas
 *
 * @param client - Client to use
 * @param parameters - {@link EstimateInitiateWithdrawalGasParameters}
 * @returns Estimated gas. {@link EstimateInitiateWithdrawalGasReturnType}
 *
 * @example
 * import { createPublicClient, http, parseEther } from 'viem'
 * import { base, mainnet } from 'viem/chains'
 * import { estimateInitiateWithdrawalGas } from 'viem/op-stack'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 *
 * const gas = await estimateInitiateWithdrawalGas(client, {
 *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 *   request: {
 *     gas: 21_000n,
 *     to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *     value: parseEther('1'),
 *   },
 * })
 */
export async function estimateInitiateWithdrawalGas<
  chain extends Chain | undefined,
  account extends Account | undefined,
  chainOverride extends Chain | undefined = undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: EstimateInitiateWithdrawalGasParameters<
    chain,
    account,
    chainOverride
  >,
) {
  const {
    account,
    chain = client.chain,
    gas,
    maxFeePerGas,
    maxPriorityFeePerGas,
    nonce,
    request: { data = '0x', gas: l1Gas, to, value },
  } = parameters

  const params = {
    account,
    abi: l2ToL1MessagePasserAbi,
    address: contracts.l2ToL1MessagePasser.address,
    functionName: 'initiateWithdrawal',
    args: [to, l1Gas, data],
    gas,
    maxFeePerGas,
    maxPriorityFeePerGas,
    nonce,
    value,
    // TODO: Not sure `chain` is necessary since it's not used downstream
    // in `estimateContractGas` or `estimateGas`
    // @ts-ignore
    chain,
  } satisfies EstimateContractGasParameters<
    typeof l2ToL1MessagePasserAbi,
    'initiateWithdrawal'
  >
  return estimateContractGas(client, params as any)
}
