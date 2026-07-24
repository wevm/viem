import { Account, Actions, Client, http, NonceManager } from 'viem'
import { mainnet } from 'viem/chains'
import type { Address, Hex } from 'viem/utils'

export const client = Client.create({
  account: Account.fromPrivateKey(
    '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6',
    { nonceManager: NonceManager.jsonRpc() },
  ),
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

export async function sendParallelTransfers(
  client: Client.Client,
  options: sendParallelTransfers.Options,
): Promise<readonly Hex.Hex[]> {
  const { to, values } = options
  return Promise.all(
    values.map((value) => Actions.transaction.send(client, { to, value })),
  )
}

export declare namespace sendParallelTransfers {
  type Options = {
    to: Address.Address
    values: readonly bigint[]
  }
}
