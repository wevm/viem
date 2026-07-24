import { Actions, type Client } from 'viem'
import { AbiEvent, Abis, type Address } from 'viem/utils'

const transferEvent = AbiEvent.fromAbi(Abis.erc20, 'Transfer')

export async function collectTransfers(
  client: Client.Client,
  options: collectTransfers.Options,
) {
  const { fromBlock, token } = options
  const filter = await Actions.event.createFilter(client, {
    address: token,
    event: transferEvent,
    fromBlock,
  })
  const changes = await Actions.filter
    .getChanges(client, { filter })
    .catch(async (error: unknown) => {
      await Actions.filter.uninstall(client, { filter })
      throw error
    })
  const uninstalled = await Actions.filter.uninstall(client, { filter })
  return {
    transfers: changes.map(({ args }) => {
      const { from, to, value } = args
      if (!from || !to || value === undefined)
        throw new Error('incomplete Transfer event')
      return { from, to, value }
    }),
    uninstalled,
  }
}

export declare namespace collectTransfers {
  type Options = {
    fromBlock: bigint
    token: Address.Address
  }
}
