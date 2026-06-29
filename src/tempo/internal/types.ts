import type { Address } from 'abitype'
import type { TokenId } from 'ox/tempo'
import type { Account } from '../../accounts/types.js'
import type { ReadContractParameters as viem_ReadContractParameters } from '../../actions/public/readContract.js'
import type { WriteContractSyncParameters as viem_WriteContractSyncParameters } from '../../actions/wallet/writeContractSync.js'
import type { Chain, ChainToken } from '../../types/chain.js'
import type {
  IsUndefined,
  MaybeRequired,
  UnionPick,
} from '../../types/utils.js'
import type { TransactionRequestTempo } from '../Transaction.js'

/**
 * Union of token names declared on `chain`'s `tokens` config.
 */
export type TokenName<chain extends Chain | undefined> = chain extends {
  tokens: infer tokens extends Record<string, ChainToken>
}
  ? {
      [name in keyof tokens]: name
    }[keyof tokens]
  : never

/**
 * Selects a TIP20 token by `token`, which is either the name of a token
 * declared on the chain's `tokens` config, a TIP20 token id, or a contract
 * `address`.
 *
 * When `token` is a declared name (or an address/id that matches a declared
 * token), token metadata is resolved from the chain's `tokens` config.
 */
export type TokenParameter<chain extends Chain | undefined> = {
  /**
   * Token to operate on: the name of a token declared on the chain's `tokens`
   * config, a TIP20 token id, or a contract `address`.
   */
  token: TokenName<chain> | TokenId.TokenIdOrAddress
}

export type TokenParameters<chain extends Chain | undefined> =
  TokenParameter<chain> & {
    /**
     * Decimals used to convert between base units and the human-readable amount.
     * Inferred from the chain's `tokens` config when `token` matches a declared
     * token; otherwise fetched from the token contract when needed.
     */
    decimals?: number | undefined
  }

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
