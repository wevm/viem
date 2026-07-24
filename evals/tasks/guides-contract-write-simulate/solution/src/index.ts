import { Actions, type Client } from 'viem'
import { Abis, type Address } from 'viem/utils'

export async function transferToken(
  client: Client.Client,
  options: transferToken.Options,
) {
  const { amount, to, token } = options
  const { request, result } = await Actions.contract.simulate(client, {
    abi: Abis.erc20,
    address: token,
    args: [to, amount],
    functionName: 'transfer',
  })

  const hash = await Actions.contract.write(client, request)
  const receipt = await Actions.transaction.waitForReceipt(client, {
    hash,
    timeout: 120_000,
  }).receipt
  return { simulated: result, receipt }
}

export declare namespace transferToken {
  type Options = {
    amount: bigint
    to: Address.Address
    token: Address.Address
  }
}
