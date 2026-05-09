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
import { portal2Abi, portalAbi } from '../abis.js'
import type { GetContractAddressParameter } from '../types/contract.js'
import type { Withdrawal } from '../types/withdrawal.js'

export type EstimateFinalizeWithdrawalGasParameters<
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
  GetChainParameter<chain, chainOverride> &
  GetContractAddressParameter<_derivedChain, 'portal'> & {
    /** Gas limit for transaction execution on the L2. */
    gas?: bigint | undefined
    /**
     * Finalize against a specific proof submitter.
     * If unspecified, the sending account is the default.
     */
    proofSubmitter?: Address | null | undefined
    withdrawal: Withdrawal
  }
export type EstimateFinalizeWithdrawalGasReturnType = bigint
export type EstimateFinalizeWithdrawalGasErrorType =
  | EstimateContractGasErrorType
  | ErrorType

/**
 * Estimates gas required to finalize a withdrawal that occurred on an L2.
 *
 * - Docs: https://viem.sh/op-stack/actions/estimateFinalizeWithdrawalGas
 *
 * @param client - Client to use
 * @param parameters - {@link EstimateFinalizeWithdrawalGasParameters}
 * @returns Estimated gas. {@link EstimateFinalizeWithdrawalGasReturnType}
 *
 * @example
 * import { createPublicClient, http, parseEther } from 'viem'
 * import { base, mainnet } from 'viem/chains'
 * import { estimateFinalizeWithdrawalGas } from 'viem/op-stack'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 *
 * const gas = await estimateFinalizeWithdrawalGas(client, {
 *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 *   targetChain: optimism,
 *   withdrawal: { ... },
 * })
 */
export async function estimateFinalizeWithdrawalGas<
  chain extends Chain | undefined,
  account extends Account | undefined,
  chainOverride extends Chain | undefined = undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: EstimateFinalizeWithdrawalGasParameters<
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
    proofSubmitter,
    targetChain,
    withdrawal,
  } = parameters

  const portalAddress = (() => {
    if (parameters.portalAddress) return parameters.portalAddress
    if (chain) return targetChain!.contracts.portal[chain.id].address
    return Object.values(targetChain!.contracts.portal)[0].address
  })()

  const [functionName, args, abi] = proofSubmitter
    ? [
        'finalizeWithdrawalTransactionExternalProof',
        [withdrawal, proofSubmitter],
        portal2Abi,
      ]
    : ['finalizeWithdrawalTransaction', [withdrawal], portalAbi]

  const params = {
    account,
    abi,
    address: portalAddress,
    functionName,
    args,
    gas,
    maxFeePerGas,
    maxPriorityFeePerGas,
    nonce,
    // TODO: Not sure `chain` is necessary since it's not used downstream
    // in `estimateContractGas` or `estimateGas`
    // @ts-expect-error
    chain,
  } satisfies EstimateContractGasParameters

  return estimateContractGas(client, params as any)
}
