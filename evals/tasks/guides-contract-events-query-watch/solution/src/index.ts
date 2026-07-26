import { Account, Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { Abis, type Address } from 'viem/utils'

const token = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

const client = Client.create({
  account: Account.fromPrivateKey(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  ),
  chain: mainnet,
  pollingInterval: 200,
  transport: http('http://anvil:8545'),
})

export async function example() {
  function transfer(options: { amount: bigint; to: Address.Address }) {
    return Actions.token.transferSync(client, { ...options, token })
  }

  await Actions.transaction.sendSync(client, {
    to: token,
    value: 1_000_000_000_000_000_000n,
  })

  const fromBlock = (await Actions.block.getNumber(client)) + 1n
  await transfer({
    amount: 1_500_000n,
    to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  })
  await transfer({
    amount: 77_000n,
    to: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
  })
  const toBlock = await Actions.block.getNumber(client)

  const history = await Actions.contract.getLogs(client, {
    abi: Abis.erc20,
    address: token,
    eventName: 'Transfer',
    fromBlock,
    strict: true,
    toBlock,
  })

  const watch = Actions.contract.watchEvent(client, {
    abi: Abis.erc20,
    address: token,
    eventName: 'Transfer',
    fromBlock: toBlock + 1n,
    strict: true,
  })
  try {
    const watched = (async () => {
      for await (const { logs } of watch) {
        const [log] = logs
        if (log) return log.args
      }
      throw new Error('watch ended before a transfer arrived')
    })()
    await transfer({
      amount: 424_242n,
      to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    })
    return {
      history: history.map(({ args }) => args),
      watched: await watched,
    }
  } finally {
    watch.off()
  }
}
