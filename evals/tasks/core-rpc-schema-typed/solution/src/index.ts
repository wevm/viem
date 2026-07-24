import { Actions, Client as core_Client, http } from 'viem'
import { type Address, Hex, RpcSchema } from 'viem/utils'
import { z } from 'viem/zod'

export const schema = z.RpcSchema.from({
  anvil_setBalance: {
    params: z.tuple([z.Address.Address, z.Hex.Hex]),
    returns: z.void(),
  },
})

export async function setBalance(
  client: setBalance.Client,
  options: setBalance.Options,
): Promise<bigint> {
  const { address, wei } = options
  await client.request({
    method: 'anvil_setBalance',
    params: [address, Hex.fromNumber(wei)],
  })
  return Actions.address.getBalance(client, { address })
}

export declare namespace setBalance {
  type Client = core_Client.Client<
    undefined,
    undefined,
    ReturnType<typeof http>,
    undefined,
    RpcSchema.ToGeneric<typeof schema>
  >

  type Options = {
    address: Address.Address
    wei: bigint
  }
}
