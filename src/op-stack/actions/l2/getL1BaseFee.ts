import type { Address, Errors } from 'ox'

import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { read } from '../../../core/actions/contract/read.js'
import { gasPriceOracleAbi } from '../../abis.js'
import { resolveGasPriceOracleAddress } from './internal.js'

/** Returns the current L1 base fee reported by the gas price oracle. */
export async function getL1BaseFee<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: getL1BaseFee.Options = {},
): Promise<getL1BaseFee.ReturnType> {
  const { chain = client.chain, gasPriceOracleAddress } = options
  const address = resolveGasPriceOracleAddress({
    address: gasPriceOracleAddress,
    chain,
  })
  return read(client, {
    abi: gasPriceOracleAbi,
    address,
    functionName: 'l1BaseFee',
  })
}

export declare namespace getL1BaseFee {
  /** Options for {@link getL1BaseFee}. */
  type Options = {
    /** Chain containing the gas price oracle. @default client.chain */
    chain?: Chain.Chain | null | undefined
    /** Gas price oracle address. */
    gasPriceOracleAddress?: Address.Address | undefined
  }

  /** Return type of {@link getL1BaseFee}. */
  type ReturnType = bigint

  /** Errors thrown by {@link getL1BaseFee}. */
  type ErrorType = read.ErrorType | Errors.GlobalErrorType
}
