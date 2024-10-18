import type { Address } from '../../../accounts/index.js'
import { readContract } from '../../../actions/index.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { AccountNotFoundError } from '../../../errors/account.js'
import type { BaseError } from '../../../errors/base.js'
import type { Account, GetAccountParameter } from '../../../types/account.js'
import type { BlockTag } from '../../../types/block.js'
import type { Chain } from '../../../types/chain.js'
import { parseAccount } from '../../../utils/index.js'
import { erc20Abi } from '../../constants/abis.js'

export type AllowanceL1Parameters<
  TAccount extends Account | undefined = Account | undefined,
> = GetAccountParameter<TAccount> & {
  token: Address
  bridgeAddress: Address
  blockTag?: BlockTag
}

export type getAllowanceL1ReturnType = bigint

export type getAllowanceL1L1ErrorType = AccountNotFoundError | BaseError

export async function getAllowanceL1<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  client: Client<Transport, TChain, TAccount>,
  parameters: AllowanceL1Parameters<TAccount>,
): Promise<getAllowanceL1ReturnType> {
  const {
    token,
    bridgeAddress,
    blockTag,
    account: account_,
  } = parameters as AllowanceL1Parameters<TAccount>

  const account = account_ ? parseAccount(account_) : client.account

  return await readContract(client, {
    abi: erc20Abi,
    address: token,
    functionName: 'allowance',
    args: [account!.address, bridgeAddress],
    blockTag: blockTag,
  })
}
