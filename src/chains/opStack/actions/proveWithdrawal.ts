import type { Address } from 'abitype'
import {
  type EstimateContractGasErrorType,
  estimateContractGas,
} from '../../../actions/public/estimateContractGas.js'
import {
  type WriteContractErrorType,
  writeContract,
} from '../../../actions/wallet/writeContract.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { ErrorType } from '../../../errors/utils.js'
import type { Account, GetAccountParameter } from '../../../types/account.js'
import type {
  Chain,
  DeriveChain,
  GetChainParameter,
} from '../../../types/chain.js'
import type { Hash, Hex } from '../../../types/misc.js'
import type { UnionEvaluate, UnionOmit } from '../../../types/utils.js'
import type { FormattedTransactionRequest } from '../../../utils/formatters/transactionRequest.js'
import { portalAbi } from '../abis.js'
import type { GetContractAddressParameter } from '../types/contract.js'

export type ProveWithdrawalParameters<
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
    /**
     * Gas limit for transaction execution on the L1.
     * `null` to skip gas estimation & defer calculation to signer.
     */
    gas?: bigint | null
    l2OutputIndex: bigint
    outputRootProof: {
      version: Hex
      stateRoot: Hex
      messagePasserStorageRoot: Hex
      latestBlockhash: Hex
    }
    withdrawalProof: readonly Hex[]
    withdrawalTransaction: {
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
  | EstimateContractGasErrorType
  | WriteContractErrorType
  | ErrorType

/**
 * Proves a withdrawal that occurred on an L2. Used in the Withdrawal flow.
 *
 * - Docs: https://viem.sh/op-stack/actions/proveWithdrawal.html
 *
 * @param client - Client to use
 * @param parameters - {@link ProveWithdrawalParameters}
 * @returns The prove transaction hash. {@link ProveWithdrawalReturnType}
 *
 * @example
 * import { createWalletClient, http } from 'viem'
 * import { optimism } from 'viem/chains'
 * import { proveWithdrawal } from 'viem/op-stack'
 *
 * const walletClientL1 = createWalletClient({
 *   chain: optimism,
 *   transport: http(),
 * })
 *
 * const request = await proveWithdrawal(walletClientL1, {
 *   l2OutputIndex: 4529n,
 *   outputRootProof: { ... },
 *   withdrawalProof: [ ... ],
 *   withdrawalTransaction: { ... },
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
    withdrawalTransaction,
  } = parameters

  const portalAddress = (() => {
    if (parameters.portalAddress) return parameters.portalAddress
    if (chain) return targetChain!.contracts.portal[chain.id].address
    return Object.values(targetChain!.contracts.portal)[0].address
  })()

  const args = {
    account,
    abi: portalAbi,
    address: portalAddress,
    chain,
    functionName: 'proveWithdrawalTransaction',
    args: [
      withdrawalTransaction,
      l2OutputIndex,
      outputRootProof,
      withdrawalProof,
    ],
    gas,
    maxFeePerGas,
    maxPriorityFeePerGas,
    nonce,
  } as any

  const gas_ =
    typeof gas !== 'number' && gas !== null
      ? await estimateContractGas(client, args)
      : undefined
  return writeContract(client, { ...args, gas: gas_ })
}
