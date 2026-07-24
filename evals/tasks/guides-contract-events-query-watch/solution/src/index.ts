import { Actions, type Client } from 'viem'
import { Abis, type Address } from 'viem/utils'

export async function getTransferHistory(
  client: Client.Client,
  options: getTransferHistory.Options,
) {
  const { fromBlock, toBlock, token } = options
  const logs = await Actions.contract.getLogs(client, {
    abi: Abis.erc20,
    address: token,
    eventName: 'Transfer',
    fromBlock,
    toBlock,
  })
  return logs.map(({ args }) => {
    const { from, to, value } = args
    if (!from || !to || value === undefined)
      throw new Error('incomplete Transfer event')
    return { from, to, value }
  })
}

export declare namespace getTransferHistory {
  type Options = {
    fromBlock: bigint
    toBlock: bigint
    token: Address.Address
  }
}

export async function waitForNextTransfer(
  client: Client.Client,
  options: waitForNextTransfer.Options,
) {
  return new Promise<waitForNextTransfer.Transfer>((resolve, reject) => {
    const watch = Actions.contract.watchEvent(client, {
      abi: Abis.erc20,
      address: options.token,
      eventName: 'Transfer',
    })
    watch.onLogs(([log]) => {
      if (!log) return
      const { from, to, value } = log.args
      if (!from || !to || value === undefined) {
        watch.off()
        reject(new Error('incomplete Transfer event'))
        return
      }
      watch.off()
      resolve({ from, to, value })
    })
    watch.onError((error) => {
      watch.off()
      reject(error)
    })
  })
}

export declare namespace waitForNextTransfer {
  type Options = {
    token: Address.Address
  }

  type Transfer = {
    from: Address.Address
    to: Address.Address
    value: bigint
  }
}
