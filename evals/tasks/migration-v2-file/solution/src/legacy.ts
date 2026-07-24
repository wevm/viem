import { Account, Client, http, publicActions, walletActions } from 'viem'
import { mainnet } from 'viem/chains'
import { Value } from 'viem/utils'

const rpcUrl = 'http://anvil:8545'

const publicClient = Client.create({
  chain: mainnet,
  transport: http(rpcUrl),
}).extend(publicActions())

export async function getEthBalance(address: `0x${string}`): Promise<string> {
  const balance = await publicClient.address.getBalance({ address })
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
  return publicClient.transaction.waitForReceipt({ hash }).receipt
}

export async function getLatestBlockNumber(): Promise<bigint> {
  return publicClient.block.getNumber()
}
