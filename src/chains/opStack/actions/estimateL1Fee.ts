import type { Address } from 'abitype'

import {
  type ReadContractErrorType,
  readContract,
} from '../../../actions/public/readContract.js'
import {
  type PrepareTransactionRequestErrorType,
  type PrepareTransactionRequestParameters,
  prepareTransactionRequest,
} from '../../../actions/wallet/prepareTransactionRequest.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { ErrorType } from '../../../errors/utils.js'
import type { Account, GetAccountParameter } from '../../../types/account.js'
import { type Chain, type GetChainParameter } from '../../../types/chain.js'
import type {
  TransactionRequestEIP1559,
  TransactionSerializable,
} from '../../../types/transaction.js'
import type { RequestErrorType } from '../../../utils/buildRequest.js'
import { getChainContractAddress } from '../../../utils/chain/getChainContractAddress.js'
import { type HexToNumberErrorType } from '../../../utils/encoding/fromHex.js'
import {
  type AssertRequestErrorType,
  type AssertRequestParameters,
  assertRequest,
} from '../../../utils/transaction/assertRequest.js'
import {
  type SerializeTransactionErrorType,
  serializeTransaction,
} from '../../../utils/transaction/serializeTransaction.js'
import { gasPriceOracleAbi } from '../abis.js'
import { contracts } from '../contracts.js'

export type EstimateL1FeeParameters<
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
  TChainOverride extends Chain | undefined = undefined,
> = Omit<TransactionRequestEIP1559, 'from'> &
  GetAccountParameter<TAccount> &
  GetChainParameter<TChain, TChainOverride> & {
    /** Gas price oracle address. */
    gasPriceOracleAddress?: Address
  }

export type EstimateL1FeeReturnType = bigint

export type EstimateL1FeeErrorType =
  | RequestErrorType
  | PrepareTransactionRequestErrorType
  | AssertRequestErrorType
  | SerializeTransactionErrorType
  | HexToNumberErrorType
  | ReadContractErrorType
  | ErrorType

/**
 * Estimates the L1 data fee required to execute an L2 transaction.
 *
 * @param client - Client to use
 * @param parameters - {@link EstimateL1FeeParameters}
 * @returns The fee (in wei). {@link EstimateL1FeeReturnType}
 *
 * @example
 * import { createPublicClient, http, parseEther } from 'viem'
 * import { optimism } from 'viem/chains'
 * import { estimateL1Fee } from 'viem/chains/optimism'
 *
 * const client = createPublicClient({
 *   chain: optimism,
 *   transport: http(),
 * })
 * const l1Fee = await estimateL1Fee(client, {
 *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *   value: parseEther('1'),
 * })
 */
export async function estimateL1Fee<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
  TChainOverride extends Chain | undefined = undefined,
>(
  client: Client<Transport, TChain, TAccount>,
  args: EstimateL1FeeParameters<TChain, TAccount, TChainOverride>,
): Promise<EstimateL1FeeReturnType> {
  const {
    chain = client.chain,
    gasPriceOracleAddress: gasPriceOracleAddress_,
  } = args

  const gasPriceOracleAddress = (() => {
    if (gasPriceOracleAddress_) return gasPriceOracleAddress_
    if (chain)
      return getChainContractAddress({
        chain,
        contract: 'gasPriceOracle',
      })
    return contracts.gasPriceOracle.address
  })()

  // Populate transaction with required fields to accurately estimate gas.
  const request = await prepareTransactionRequest(
    client,
    args as PrepareTransactionRequestParameters,
  )

  assertRequest(request as AssertRequestParameters)

  const transaction = serializeTransaction({
    ...request,
    type: 'eip1559',
  } as TransactionSerializable)

  return readContract(client, {
    abi: gasPriceOracleAbi,
    address: gasPriceOracleAddress,
    functionName: 'getL1Fee',
    args: [transaction as any],
  })
}
