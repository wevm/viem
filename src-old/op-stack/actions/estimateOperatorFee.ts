import type { Address } from 'abitype'

import {
  type EstimateGasErrorType,
  type EstimateGasParameters,
  estimateGas,
} from '../../actions/public/estimateGas.js'
import {
  type ReadContractErrorType,
  readContract,
} from '../../actions/public/readContract.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Account, GetAccountParameter } from '../../types/account.js'
import type { Chain, GetChainParameter } from '../../types/chain.js'
import type { TransactionRequestEIP1559 } from '../../types/transaction.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'
import { getChainContractAddress } from '../../utils/chain/getChainContractAddress.js'
import type { HexToNumberErrorType } from '../../utils/encoding/fromHex.js'
import { l1BlockAbi } from '../abis.js'
import { contracts } from '../contracts.js'

export type EstimateOperatorFeeParameters<
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
  TChainOverride extends Chain | undefined = undefined,
> = Omit<TransactionRequestEIP1559, 'from'> &
  GetAccountParameter<TAccount> &
  GetChainParameter<TChain, TChainOverride> & {
    /** L1 block attributes contract address. */
    l1BlockAddress?: Address | undefined
  }

export type EstimateOperatorFeeReturnType = bigint

export type EstimateOperatorFeeErrorType =
  | RequestErrorType
  | EstimateGasErrorType
  | HexToNumberErrorType
  | ReadContractErrorType
  | ErrorType

/**
 * Estimates the operator fee required to execute an L2 transaction.
 *
 * Operator fees are part of the Isthmus upgrade and allow OP Stack operators
 * to recover costs related to Alt-DA, ZK proving, or custom gas tokens.
 * Returns 0 for pre-Isthmus chains or when operator fee functions don't exist.
 *
 * @param client - Client to use
 * @param parameters - {@link EstimateOperatorFeeParameters}
 * @returns The operator fee (in wei). {@link EstimateOperatorFeeReturnType}
 *
 * @example
 * import { createPublicClient, http, parseEther } from 'viem'
 * import { optimism } from 'viem/chains'
 * import { estimateOperatorFee } from 'viem/chains/optimism'
 *
 * const client = createPublicClient({
 *   chain: optimism,
 *   transport: http(),
 * })
 * const operatorFee = await estimateOperatorFee(client, {
 *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *   value: parseEther('1'),
 * })
 */
export async function estimateOperatorFee<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
  TChainOverride extends Chain | undefined = undefined,
>(
  client: Client<Transport, TChain, TAccount>,
  args: EstimateOperatorFeeParameters<TChain, TAccount, TChainOverride>,
): Promise<EstimateOperatorFeeReturnType> {
  const { chain = client.chain, l1BlockAddress: l1BlockAddress_ } = args

  const l1BlockAddress = (() => {
    if (l1BlockAddress_) return l1BlockAddress_
    if (chain?.contracts?.l1Block)
      return getChainContractAddress({
        chain,
        contract: 'l1Block',
      })
    return contracts.l1Block.address
  })()

  // Try to get operator fee parameters. If any of these calls fail,
  // it means this is a pre-Isthmus chain and operator fees don't apply
  try {
    // Get operator fee parameters first to fail fast if not supported
    const [operatorFeeScalar, operatorFeeConstant] = await Promise.all([
      readContract(client, {
        abi: l1BlockAbi,
        address: l1BlockAddress,
        functionName: 'operatorFeeScalar',
      }),
      readContract(client, {
        abi: l1BlockAbi,
        address: l1BlockAddress,
        functionName: 'operatorFeeConstant',
      }),
    ])

    // Estimate gas for the actual transaction
    const gasUsed = await estimateGas(client, args as EstimateGasParameters)

    // Calculate operator fee: saturatingAdd(saturatingMul(gasUsed, scalar) / 1e6, constant)
    // Using saturating arithmetic to prevent overflow
    const scaledFee = (gasUsed * BigInt(operatorFeeScalar)) / 1_000_000n
    return scaledFee + BigInt(operatorFeeConstant)
  } catch {
    // If any call fails, this is likely a pre-Isthmus chain or the contract
    // doesn't support these functions. Return 0 for operator fee.
    return 0n
  }
}
