import type { Address } from 'abitype'

import {
  type ReadContractErrorType,
  readContract,
} from '../../actions/public/readContract.js'
import type { PrepareTransactionRequestErrorType } from '../../actions/wallet/prepareTransactionRequest.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Chain, GetChainParameter } from '../../types/chain.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'
import { getChainContractAddress } from '../../utils/chain/getChainContractAddress.js'
import type { HexToNumberErrorType } from '../../utils/encoding/fromHex.js'

import { gasPriceOracleAbi } from '../abis.js'
import { contracts } from '../contracts.js'

export type GetL1BaseFeeParameters<
  TChain extends Chain | undefined = Chain | undefined,
  TChainOverride extends Chain | undefined = undefined,
> = GetChainParameter<TChain, TChainOverride> & {
  /** Gas price oracle address. */
  gasPriceOracleAddress?: Address | undefined
}

export type GetL1BaseFeeReturnType = bigint

export type GetL1BaseFeeErrorType =
  | RequestErrorType
  | PrepareTransactionRequestErrorType
  | HexToNumberErrorType
  | ReadContractErrorType
  | ErrorType

/**
 * get the L1 base fee
 *
 * @param client - Client to use
 * @param parameters - {@link GetL1BaseFeeParameters}
 * @returns The basefee (in wei). {@link GetL1BaseFeeReturnType}
 *
 * @example
 * import { createPublicClient, http, parseEther } from 'viem'
 * import { optimism } from 'viem/chains'
 * import { getL1BaseFee } from 'viem/chains/optimism'
 *
 * const client = createPublicClient({
 *   chain: optimism,
 *   transport: http(),
 * })
 * const l1BaseFee = await getL1BaseFee(client)
 */
export async function getL1BaseFee<
  TChain extends Chain | undefined,
  TChainOverride extends Chain | undefined = undefined,
>(
  client: Client<Transport, TChain>,
  args?: GetL1BaseFeeParameters<TChain, TChainOverride> | undefined,
): Promise<GetL1BaseFeeReturnType> {
  const {
    chain = client.chain,
    gasPriceOracleAddress: gasPriceOracleAddress_,
  } = args || {}

  const gasPriceOracleAddress = (() => {
    if (gasPriceOracleAddress_) return gasPriceOracleAddress_
    if (chain)
      return getChainContractAddress({
        chain,
        contract: 'gasPriceOracle',
      })
    return contracts.gasPriceOracle.address
  })()

  return readContract(client, {
    abi: gasPriceOracleAbi,
    address: gasPriceOracleAddress,
    functionName: 'l1BaseFee',
  })
}
