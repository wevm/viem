import { parseAbi } from 'abitype'

/** ABI for the Nonce Manager precompile (`INonceManager`). */
export const nonceManagerAbi = parseAbi([
  'function getNonce(address account, uint256 nonceKey) view returns (uint64)',
])
