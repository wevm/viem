import type { Address } from 'abitype'
import { parseAccount } from '../../accounts/utils/parseAccount.js'
import { readContract } from '../../actions/public/readContract.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { erc20Abi } from '../../constants/abis.js'
import type { AccountNotFoundError } from '../../errors/account.js'
import type { BaseError } from '../../errors/base.js'
import type { Account, GetAccountParameter } from '../../types/account.js'
import type { BlockTag } from '../../types/block.js'
import type { Chain } from '../../types/chain.js'

export type GetL1AllowanceParameters<
  TAccount extends Account | undefined = Account | undefined,
> = GetAccountParameter<TAccount> & {
  bridgeAddress: Address
  blockTag?: BlockTag
  token: Address
}

export type GetL1AllowanceReturnType = bigint

export type GetL1AllowanceErrorType = AccountNotFoundError | BaseError

export async function getL1Allowance<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  client: Client<Transport, TChain, TAccount>,
  parameters: GetL1AllowanceParameters<TAccount>,
): Promise<GetL1AllowanceReturnType> {
  const { token, bridgeAddress, blockTag, account: account_ } = parameters

  const account = account_ ? parseAccount(account_) : client.account

  return await readContract(client, {
    abi: erc20Abi,
    address: token,
    functionName: 'allowance',
    args: [account!.address, bridgeAddress],
    blockTag: blockTag,
  })
}
