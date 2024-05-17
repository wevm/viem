import type { Address } from 'abitype'
import { erc20Abi } from 'abitype/abis'
import {
  type WriteContractParameters,
  writeContract,
} from '../../actions/index.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account, GetAccountParameter } from '../../types/account.js'
import type { Chain, GetChainParameter } from '../../types/chain.js'
import type { Hash } from '../../types/misc.js'
import { parseAccount } from '../../utils/accounts.js'

export type ApproveErc20L1Parameters<
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
> = GetAccountParameter<TAccount> &
  (TChain extends undefined ? {} : GetChainParameter<TChain, chainOverride>) & {
    token: Address
    amount: bigint
  }
export async function approveErc20L1<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
  chainOverride extends Chain | undefined = undefined,
>(
  client: Client<Transport, TChain, TAccount>,
  parameters: ApproveErc20L1Parameters<TChain, TAccount, chainOverride>,
): Promise<Hash> {
  const { account: account_, token, amount } = parameters

  const account = account_ ? parseAccount(account_) : client.account

  return await writeContract(client, {
    account: account!,
    abi: erc20Abi,
    chain: client.chain,
    address: token,
    functionName: 'approve',
    args: [account!.address, amount],
  } satisfies WriteContractParameters as any)
}
