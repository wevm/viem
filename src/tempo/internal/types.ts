import type { Address } from 'abitype'
import type { Account } from '../../accounts/types.js'
import type { ReadContractParameters as viem_ReadContractParameters } from '../../actions/public/readContract.js'
import type { WriteContractSyncParameters as viem_WriteContractSyncParameters } from '../../actions/wallet/writeContractSync.js'
import type { Chain } from '../../types/chain.js'
import type {
  IsUndefined,
  MaybeRequired,
  UnionPick,
} from '../../types/utils.js'
import type { TransactionRequestTempo } from '../Transaction.js'

export type GetAccountParameter<
  account extends Account | undefined = Account | undefined,
  accountOverride extends Account | Address | undefined = Account | Address,
  required extends boolean = true,
  nullish extends boolean = false,
> = MaybeRequired<
  {
    account?:
      | accountOverride
      | Account
      | Address
      | (nullish extends true ? null : never)
      | undefined
  },
  IsUndefined<account> extends true
    ? required extends true
      ? true
      : false
    : false
>

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
> &
  UnionPick<
    TransactionRequestTempo,
    | 'keyAuthorization'
    | 'feeToken'
    | 'feePayer'
    | 'nonceKey'
    | 'validAfter'
    | 'validBefore'
  >
