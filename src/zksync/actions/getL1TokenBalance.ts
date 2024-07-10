import type { Address } from '../../accounts/index.js'
import { parseAccount } from '../../accounts/utils/parseAccount.js'
import { readContract } from '../../actions/index.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { erc20Abi } from '../../constants/abis.js'
import type { AccountNotFoundErrorType } from '../../errors/account.js'
import type { BaseErrorType } from '../../errors/base.js'
import type { Account, GetAccountParameter } from '../../types/account.js'
import type { BlockTag } from '../../types/block.js'
import type { Chain } from '../../types/chain.js'
import {
  TokenIsEthError,
  type TokenIsEthErrorType,
} from '../errors/token-is-eth.js'
import { isEth } from '../utils/isEth.js'

export type GetL1TokenBalanceParameters<
  account extends Account | undefined = Account | undefined,
> = GetAccountParameter<account> & { token: Address } & (
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

export type GetL1TokenBalanceReturnType = bigint

export type GetL1TokenBalanceErrorType =
  | AccountNotFoundErrorType
  | TokenIsEthErrorType
  | BaseErrorType

export async function getL1TokenBalance<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: GetL1TokenBalanceParameters<account>,
): Promise<GetL1TokenBalanceReturnType> {
  const {
    account: account_ = client.account,
    blockTag,
    blockNumber,
    token,
  } = parameters

  if (isEth(token!)) throw new TokenIsEthError()

  const account = account_ ? parseAccount(account_) : client.account

  return await readContract(client, {
    abi: erc20Abi,
    address: token!,
    functionName: 'balanceOf',
    args: [account!.address],
    blockNumber: blockNumber,
    blockTag: blockTag,
  })
}
