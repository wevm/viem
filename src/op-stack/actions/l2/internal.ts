import type { Address } from 'ox'

import type * as Chain from '../../../core/Chain.js'
import { contracts } from '../../contracts.js'

/** Resolves the OP Stack gas price oracle address. @internal */
export function resolveGasPriceOracleAddress(options: {
  address?: Address.Address | undefined
  chain?: Chain.Chain | null | undefined
}): Address.Address {
  if (options.address) return options.address
  const contract = options.chain?.contracts?.gasPriceOracle
  if (contract && 'address' in contract) return contract.address
  return contracts.gasPriceOracle.address
}
