import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { Hex } from 'viem/utils'
import { z } from 'viem/zod'

const schema = z.RpcSchema.from({
  anvil_setBalance: {
    params: z.tuple([z.Address.Address, z.Hex.Hex]),
    returns: z.void(),
  },
})

const client = Client.create({
  chain: mainnet,
  schema,
  transport: http('http://anvil:8545'),
})

export async function example() {
  const address = '0x4242424242424242424242424242424242424242'
  const wei = 123_456_789_012_345_678_901n
  await client.request({
    method: 'anvil_setBalance',
    params: [address, Hex.fromNumber(wei)],
  })
  return Actions.address.getBalance(client, { address })
}
