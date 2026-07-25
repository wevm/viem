import { Account, Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { Abis } from 'viem/utils'

const token = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const whale = '0x28C6c06298d514Db089934071355E5743bf21d60'

const client = Client.create({
  account: Account.from(whale),
  chain: mainnet,
  pollingInterval: 200,
  transport: http('http://anvil:8545'),
})

function transfer(to: `0x${string}`, amount: bigint) {
  return Actions.token.transferSync(client, { amount, to, token })
}

export async function example() {
  await Actions.address.impersonate(client, { address: whale })
  let stopWatching = () => {}
  try {
    await Actions.address.setBalance(client, {
      address: whale,
      value: 10_000_000_000_000_000_000n,
    })
    const fromBlock = (await Actions.block.getNumber(client)) + 1n
    await transfer('0x70997970C51812dc3A010C7d01b50e0d17dc79C8', 1_500_000n)
    await transfer('0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', 77_000n)
    const toBlock = await Actions.block.getNumber(client)

    const history = await Actions.contract.getLogs(client, {
      abi: Abis.erc20,
      address: token,
      eventName: 'Transfer',
      fromBlock,
      toBlock,
    })

    const watchFromBlock = toBlock + 1n
    const watched = new Promise<{
      from: `0x${string}`
      to: `0x${string}`
      value: bigint
    }>((resolve, reject) => {
      const watch = Actions.contract.watchEvent(client, {
        abi: Abis.erc20,
        address: token,
        eventName: 'Transfer',
        fromBlock: watchFromBlock,
      })
      stopWatching = () => watch.off()
      watch.onLogs(([log]) => {
        if (!log) return
        const { from, to, value } = log.args
        if (!from || !to || value === undefined) return
        resolve({ from, to, value })
      })
      watch.onError(reject)
    })
    await transfer('0x70997970C51812dc3A010C7d01b50e0d17dc79C8', 424_242n)

    return {
      history: history.map(({ args }) => args),
      token,
      watched: await watched,
    }
  } finally {
    stopWatching()
    await Actions.address.stopImpersonating(client, { address: whale })
  }
}
