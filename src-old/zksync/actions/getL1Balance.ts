import type { Address } from 'abitype'
import { parseAccount } from '../../accounts/utils/parseAccount.js'
import {
  type GetBalanceParameters,
  getBalance,
} from '../../actions/public/getBalance.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { AccountNotFoundError } from '../../errors/account.js'
import type { BaseError } from '../../errors/base.js'
import type { Account, GetAccountParameter } from '../../types/account.js'
import type { BlockTag } from '../../types/block.js'
import type { Chain } from '../../types/chain.js'
import { legacyEthAddress } from '../constants/address.js'
import { isEth } from '../utils/isEth.js'
import {
  type GetL1TokenBalanceParameters,
  getL1TokenBalance,
} from './getL1TokenBalance.js'

export type GetL1BalanceParameters<
  account extends Account | undefined = Account | undefined,
> = GetAccountParameter<account> & { token?: Address | undefined } & (
    | {
        /** The balance of the account at a block number. */
        blockNumber?: bigint | undefined
        blockTag?: undefined
      }
    | {
        blockNumber?: undefined
        /** The balance of the account at a block tag. */
        blockTag?: BlockTag | undefined
      }
  )

export type GetL1BalanceReturnType = bigint

export type GetL1BalanceErrorType = AccountNotFoundError | BaseError

export async function getL1Balance<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  ...[parameters = {}]: account extends undefined
    ? [GetL1BalanceParameters<account>]
    : [GetL1BalanceParameters<account>] | []
): Promise<GetL1BalanceReturnType> {
  const {
    account: account_ = client.account,
    blockNumber,
    blockTag,
    token = legacyEthAddress,
  } = parameters

  const account = account_ ? parseAccount(account_) : undefined

  if (isEth(token))
    return await getBalance(client, {
      address: account!.address,
      blockNumber,
      blockTag,
    } as GetBalanceParameters)

  return await getL1TokenBalance(client, {
    ...(parameters as GetL1TokenBalanceParameters<account>),
  })
}
