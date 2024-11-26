import type { Address } from 'abitype'
import {
  type WriteContractErrorType,
  type WriteContractParameters,
  writeContract,
} from '../../actions/wallet/writeContract.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Account, GetAccountParameter } from '../../types/account.js'
import type {
  Chain,
  DeriveChain,
  GetChainParameter,
} from '../../types/chain.js'
import type { Hash, Hex } from '../../types/misc.js'
import type { UnionEvaluate, UnionOmit } from '../../types/utils.js'
import type { FormattedTransactionRequest } from '../../utils/formatters/transactionRequest.js'
import { portalAbi } from '../abis.js'
import type { GetContractAddressParameter } from '../types/contract.js'
import {
  type EstimateProveWithdrawalGasErrorType,
  type EstimateProveWithdrawalGasParameters,
  estimateProveWithdrawalGas,
} from './estimateProveWithdrawalGas.js'

export type ProveWithdrawalParameters<
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
  _derivedChain extends Chain | undefined = DeriveChain<chain, chainOverride>,
> = UnionEvaluate<
  UnionOmit<
    FormattedTransactionRequest<_derivedChain>,
    | 'accessList'
    | 'blobs'
    | 'data'
    | 'from'
    | 'gas'
    | 'maxFeePerBlobGas'
    | 'gasPrice'
    | 'to'
    | 'type'
    | 'value'
  >
> &
  GetAccountParameter<account, Account | Address> &
  GetChainParameter<chain, chainOverride> &
  GetContractAddressParameter<_derivedChain, 'portal'> & {
    /**
     * Gas limit for transaction execution on the L1.
     * `null` to skip gas estimation & defer calculation to signer.
     */
    gas?: bigint | null | undefined
    l2OutputIndex: bigint
    outputRootProof: {
      version: Hex
      stateRoot: Hex
      messagePasserStorageRoot: Hex
      latestBlockhash: Hex
    }
    withdrawalProof: readonly Hex[]
    withdrawal: {
      data: Hex
      gasLimit: bigint
      nonce: bigint
      sender: Address
      target: Address
      value: bigint
    }
  }
export type ProveWithdrawalReturnType = Hash
export type ProveWithdrawalErrorType =
  | EstimateProveWithdrawalGasErrorType
  | WriteContractErrorType
  | ErrorType

/**
 * Proves a withdrawal that occurred on an L2. Used in the Withdrawal flow.
 *
 * - Docs: https://viem.sh/op-stack/actions/proveWithdrawal
 *
 * @param client - Client to use
 * @param parameters - {@link ProveWithdrawalParameters}
 * @returns The prove transaction hash. {@link ProveWithdrawalReturnType}
 *
 * @example
 * import { createWalletClient, http } from 'viem'
 * import { mainnet, optimism } from 'viem/chains'
 * import { proveWithdrawal } from 'viem/op-stack'
 *
 * const walletClientL1 = createWalletClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 *
 * const request = await proveWithdrawal(walletClientL1, {
 *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 *   l2OutputIndex: 4529n,
 *   outputRootProof: { ... },
 *   targetChain: optimism,
 *   withdrawalProof: [ ... ],
 *   withdrawal: { ... },
 * })
 */
export async function proveWithdrawal<
  chain extends Chain | undefined,
  account extends Account | undefined,
  chainOverride extends Chain | undefined = undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: ProveWithdrawalParameters<chain, account, chainOverride>,
): Promise<ProveWithdrawalReturnType> {
  const {
    account,
    chain = client.chain,
    gas,
    l2OutputIndex,
    maxFeePerGas,
    maxPriorityFeePerGas,
    nonce,
    outputRootProof,
    targetChain,
    withdrawalProof,
    withdrawal,
  } = parameters

  const portalAddress = (() => {
    if (parameters.portalAddress) return parameters.portalAddress
    if (chain) return targetChain!.contracts.portal[chain.id].address
    return Object.values(targetChain!.contracts.portal)[0].address
  })()

  const gas_ =
    typeof gas !== 'bigint' && gas !== null
      ? await estimateProveWithdrawalGas(
          client,
          parameters as EstimateProveWithdrawalGasParameters,
        )
      : (gas ?? undefined)

  return writeContract(client, {
    account: account!,
    abi: portalAbi,
    address: portalAddress,
    chain,
    functionName: 'proveWithdrawalTransaction',
    args: [withdrawal, l2OutputIndex, outputRootProof, withdrawalProof],
    gas: gas_,
    maxFeePerGas,
    maxPriorityFeePerGas,
    nonce,
  } satisfies WriteContractParameters as any)
}
