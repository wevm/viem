import type { Address } from '../../../accounts/index.js'
import { readContract } from '../../../actions/index.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import { erc20Abi } from '../../../constants/abis.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import { TokenIsEthError } from '../../errors/token-is-eth.js'
import { isEth } from '../../utils/isEth.js'

export type GetErc20TokenBalanceParameters = {
  token: Address
  address?: Address
}

export type GetErc20TokenBalanceReturnType = bigint

export async function getErc20TokenBalance<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  client: Client<Transport, TChain, TAccount>,
  parameters: GetErc20TokenBalanceParameters,
): Promise<GetErc20TokenBalanceReturnType> {
  if (isEth(parameters.token!)) throw new TokenIsEthError()

  if (!parameters.address && !client.account)
    throw new Error('Missing address parameter.')

  return await readContract(client, {
    abi: erc20Abi,
    address: parameters.token!,
    functionName: 'balanceOf',
    args: [parameters.address ? parameters.address : client.account!.address],
    blockTag: 'latest',
  })
}
