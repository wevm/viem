import { Account, Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { Abis } from 'viem/utils'

const token = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const whale = '0x28C6c06298d514Db089934071355E5743bf21d60'

const client = Client.create({
  account: Account.from(whale),
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

export async function example() {
  const amount = 12_345_678n
  const to = '0x4242424242424242424242424242424242424242'

  await Actions.address.impersonate(client, { address: whale })
  try {
    await Actions.address.setBalance(client, {
      address: whale,
      value: 10_000_000_000_000_000_000n,
    })
    const { request, result } = await Actions.contract.simulate(client, {
      abi: Abis.erc20,
      address: token,
      args: [to, amount],
      functionName: 'transfer',
    })
    const receipt = await Actions.contract.writeSync(client, request)
    return { amount, receipt, simulated: result, to, token }
  } finally {
    await Actions.address.stopImpersonating(client, { address: whale })
  }
}
