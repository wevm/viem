import type { Account } from '../../accounts/types.js'
import type { ReadContractParameters as viem_ReadContractParameters } from '../../actions/public/readContract.js'
import type { WriteContractSyncParameters as viem_WriteContractSyncParameters } from '../../actions/wallet/writeContractSync.js'
import type { Chain } from '../../types/chain.js'
import type { UnionPick } from '../../types/utils.js'

export type ReadParameters = Pick<
  viem_ReadContractParameters<never, never, never>,
  'account' | 'blockNumber' | 'blockOverrides' | 'blockTag' | 'stateOverride'
>

export type WriteParameters<
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
> = UnionPick<
  viem_WriteContractSyncParameters<never, never, never, chain, account>,
  | 'account'
  | 'chain'
  | 'gas'
  | 'maxFeePerGas'
  | 'maxPriorityFeePerGas'
  | 'nonce'
  | 'throwOnReceiptRevert'
>
