// Imports only `viem/utils`: entrypoint-isolated coverage for its export table.
import { Abi } from 'viem/utils'

export const abi = Abi.from([
  'function balanceOf(address owner) view returns (uint256)',
])
