import type { Address } from 'abitype'

import {
  type ReadContractErrorType,
  readContract,
} from '../../actions/public/readContract.js'
import {
  type PrepareTransactionRequestErrorType,
  type PrepareTransactionRequestParameters,
  prepareTransactionRequest,
} from '../../actions/wallet/prepareTransactionRequest.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Account, GetAccountParameter } from '../../types/account.js'
import type { Chain, GetChainParameter } from '../../types/chain.js'
import type {
  TransactionRequestEIP1559,
  TransactionSerializable,
} from '../../types/transaction.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'
import { getChainContractAddress } from '../../utils/chain/getChainContractAddress.js'
import type { HexToNumberErrorType } from '../../utils/encoding/fromHex.js'
import {
  type AssertRequestErrorType,
  type AssertRequestParameters,
  assertRequest,
} from '../../utils/transaction/assertRequest.js'
import {
  type SerializeTransactionErrorType,
  serializeTransaction,
} from '../../utils/transaction/serializeTransaction.js'
import { gasPriceOracleAbi } from '../abis.js'
import { contracts } from '../contracts.js'

export type EstimateL1GasParameters<
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
> = Omit<TransactionRequestEIP1559, 'from'> &
  GetAccountParameter<account> &
  GetChainParameter<chain, chainOverride> & {
    /** Gas price oracle address. */
    gasPriceOracleAddress?: Address | undefined
  }

export type EstimateL1GasReturnType = bigint

export type EstimateL1GasErrorType =
  | RequestErrorType
  | PrepareTransactionRequestErrorType
  | AssertRequestErrorType
  | SerializeTransactionErrorType
  | HexToNumberErrorType
  | ReadContractErrorType
  | ErrorType

/**
 * Estimates the L1 data gas required to execute an L2 transaction.
 *
 * @param client - Client to use
 * @param parameters - {@link EstimateL1GasParameters}
 * @returns The gas estimate. {@link EstimateL1GasReturnType}
 *
 * @example
 * import { createPublicClient, http, parseEther } from 'viem'
 * import { optimism } from 'viem/chains'
 * import { estimateL1Gas } from 'viem/chains/optimism'
 *
 * const client = createPublicClient({
 *   chain: optimism,
 *   transport: http(),
 * })
 * const l1Gas = await estimateL1Gas(client, {
 *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *   value: parseEther('1'),
 * })
 */
export async function estimateL1Gas<
  chain extends Chain | undefined,
  account extends Account | undefined,
  chainOverride extends Chain | undefined = undefined,
>(
  client: Client<Transport, chain, account>,
  args: EstimateL1GasParameters<chain, account, chainOverride>,
): Promise<EstimateL1GasReturnType> {
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
    functionName: 'getL1GasUsed',
    args: [transaction as any],
  })
}
