import { Account, Client, http, publicActions, walletActions } from 'viem'
import { mainnet } from 'viem/chains'

const rpcUrl = 'http://anvil:8545'

export const publicClient = Client.create({
  chain: mainnet,
  transport: http(rpcUrl),
}).extend(publicActions())

export function getWalletClient(privateKey: `0x${string}`) {
  return Client.create({
    account: Account.fromPrivateKey(privateKey),
    chain: mainnet,
    transport: http(rpcUrl),
  }).extend(walletActions())
}
