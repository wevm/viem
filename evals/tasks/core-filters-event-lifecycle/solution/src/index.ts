import { Account, Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { AbiEvent, Abis } from 'viem/utils'

const account = Account.fromPrivateKey(
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
)
const otherAccount = Account.fromPrivateKey(
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
)
const token = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
const transferEvent = AbiEvent.fromAbi(Abis.erc20, 'Transfer')

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

export async function example() {
  await Actions.transaction.sendSync(client, {
    account,
    to: token,
    value: 1_000_000_000_000_000_000n,
  })
  await Actions.token.transferSync(client, {
    account,
    amount: 999n,
    to: otherAccount.address,
    token,
  })

  const filter = await Actions.event.createFilter(client, {
    address: token,
    args: { from: account.address },
    event: transferEvent,
    fromBlock: (await Actions.block.getNumber(client)) + 1n,
    strict: true,
  })
  try {
    await Actions.token.transferSync(client, {
      account,
      amount: 1_230_000n,
      to: otherAccount.address,
      token,
    })
    await Actions.token.transferSync(client, {
      account: otherAccount,
      amount: 999n,
      to: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
      token,
    })
    await Actions.token.transferSync(client, {
      account,
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
  }
}
