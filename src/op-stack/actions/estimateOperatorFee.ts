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
import { gasPriceOracleAbi, l1BlockAbi } from '../abis.js'
import { contracts } from '../contracts.js'

export type EstimateOperatorFeeParameters<
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
  TChainOverride extends Chain | undefined = undefined,
> = Omit<TransactionRequestEIP1559, 'from'> &
  GetAccountParameter<TAccount> &
  GetChainParameter<TChain, TChainOverride> & {
    /** Gas price oracle address. */
    gasPriceOracleAddress?: Address | undefined
    /**
     * L1 block attributes contract address.
     * @deprecated Use `gasPriceOracleAddress` instead.
     */
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
  const {
    chain = client.chain,
    gasPriceOracleAddress: gasPriceOracleAddress_,
    l1BlockAddress,
  } = args

  const gasPriceOracleAddress = (() => {
    if (gasPriceOracleAddress_) return gasPriceOracleAddress_
    if (chain)
      return getChainContractAddress({
        chain,
        contract: 'gasPriceOracle',
      })
    return contracts.gasPriceOracle.address
  })() as Address

  const gasUsed = await estimateGas(client, args as EstimateGasParameters)

  if (l1BlockAddress) {
    // `isJovian` is unavailable on Isthmus Gas Price Oracle implementations.
    const [operatorFeeScalar, operatorFeeConstant, isJovian] =
      await Promise.all([
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
        readContract(client, {
          abi: gasPriceOracleAbi,
          address: gasPriceOracleAddress,
          functionName: 'isJovian',
        }).catch(() => false),
      ])

    const scalar = BigInt(operatorFeeScalar)
    const constant = BigInt(operatorFeeConstant)
    if (isJovian) return gasUsed * scalar * 100n + constant
    return (gasUsed * scalar) / 1_000_000n + constant
  }

  return readContract(client, {
    abi: gasPriceOracleAbi,
    address: gasPriceOracleAddress,
    functionName: 'getOperatorFee',
    args: [gasUsed],
  })
}
