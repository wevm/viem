import { Account, Client, http, publicActions, walletActions } from 'viem'
import { mainnet } from 'viem/chains'
import { Value } from 'viem/utils'

const rpcUrl = 'http://anvil:8545'

const client = Client.create({
  chain: mainnet,
  transport: http(rpcUrl),
}).extend(publicActions())

export async function getBalance(address: `0x${string}`): Promise<string> {
  const balance = await client.address.getBalance({ address })
  return Value.formatEther(balance)
}

export async function sendPayment(
  privateKey: `0x${string}`,
  to: `0x${string}`,
  amountEther: string,
) {
  const account = Account.fromPrivateKey(privateKey)
  const walletClient = Client.create({
    account,
    chain: mainnet,
    transport: http(rpcUrl),
  }).extend(walletActions())
  const hash = await walletClient.transaction.send({
    to,
    value: Value.fromEther(amountEther),
  })
  return client.transaction.waitForReceipt({ hash }).receipt
}

export async function getBlockNumber(): Promise<number> {
  return Number(await client.block.getNumber())
}
