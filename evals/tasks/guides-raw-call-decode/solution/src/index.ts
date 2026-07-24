import { Actions, type Client } from 'viem'
import { type Address, Hex } from 'viem/utils'

// `balanceOf(address)` selector.
const selector = '0x70a08231'

export async function getTokenBalance(
  client: Client.Client,
  options: getTokenBalance.Options,
): Promise<bigint> {
  const { holder, token } = options
  const { data } = await Actions.call(client, {
    data: Hex.concat(selector, Hex.padLeft(holder, 32)),
    to: token,
  })
  if (!data) throw new Error('no return data')
  return Hex.toBigInt(data)
}

export declare namespace getTokenBalance {
  type Options = {
    holder: Address.Address
    token: Address.Address
  }
}
