import { Account, Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { Value } from 'viem/utils'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

export async function getEthBalance(address: `0x${string}`): Promise<string> {
  const balance = await Actions.address.getBalance(client, { address })
  return Value.formatEther(balance)
}

export async function sendPayment(
  privateKey: `0x${string}`,
  to: `0x${string}`,
  amountEther: string,
) {
  return Actions.transaction.sendSync(client, {
    account: Account.fromPrivateKey(privateKey),
    to,
    value: Value.fromEther(amountEther),
  })
}

export async function getLatestBlockNumber(): Promise<bigint> {
  return Actions.block.getNumber(client)
}
