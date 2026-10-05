import { Account, Client, http, walletActions } from 'viem'
import { mainnet } from 'viem/chains'

const account = Account.fromPrivateKey(
  '0x0000000000000000000000000000000000000000000000000000000000000001',
)

export const walletClient = Client.create({
  account,
  chain: mainnet,
  transport: http(),
}).extend(walletActions())
