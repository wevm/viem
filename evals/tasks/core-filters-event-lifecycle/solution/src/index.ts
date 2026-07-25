import { Account, Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { AbiEvent, Abis } from 'viem/utils'

const token = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const weth = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
const whale = '0x28C6c06298d514Db089934071355E5743bf21d60'
const transferEvent = AbiEvent.fromAbi(Abis.erc20, 'Transfer')

const client = Client.create({
  account: Account.from(whale),
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

export async function example() {
  const filter = await Actions.event.createFilter(client, {
    address: token,
    event: transferEvent,
    fromBlock: (await Actions.block.getNumber(client)) + 1n,
  })
  let impersonating = false
  try {
    await Actions.address.impersonate(client, { address: whale })
    impersonating = true
    await Actions.token.transferSync(client, {
      amount: 1_230_000n,
      to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      token,
    })
    await Actions.token.transferSync(client, {
      amount: 999n,
      to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      token: weth,
    })
    await Actions.token.transferSync(client, {
      amount: 45_000_000n,
      to: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
      token,
    })
    const changes = await Actions.filter.getChanges(client, { filter })
    const transfers = changes.map(({ args }) => {
      const { from, to, value } = args
      if (!from || !to || value === undefined)
        throw new Error('incomplete Transfer event')
      return { from, to, value }
    })
    const uninstalled = await Actions.filter.uninstall(client, { filter })
    return { transfers, uninstalled }
  } catch (error) {
    await Actions.filter.uninstall(client, { filter })
    throw error
  } finally {
    if (impersonating)
      await Actions.address.stopImpersonating(client, { address: whale })
  }
}
