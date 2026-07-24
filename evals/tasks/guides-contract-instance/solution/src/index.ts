import { type Client, Contract } from 'viem'
import { Abis, type Address } from 'viem/utils'

export async function auditToken(
  client: Client.Client,
  options: auditToken.Options,
) {
  const { amount, holder, recipient, token } = options

  const contract = Contract.from({
    abi: Abis.erc20,
    address: token,
    client,
  })

  const [symbol, decimals, holderBalance] = await Promise.all([
    contract.read.symbol(),
    contract.read.decimals(),
    contract.read.balanceOf({ args: [holder] }),
  ])
  const { result: transferOk } = await contract.simulate.transfer({
    account: holder,
    args: [recipient, amount],
  })

  return { decimals, holderBalance, symbol, transferOk }
}

export declare namespace auditToken {
  type Options = {
    amount: bigint
    holder: Address.Address
    recipient: Address.Address
    token: Address.Address
  }
}
