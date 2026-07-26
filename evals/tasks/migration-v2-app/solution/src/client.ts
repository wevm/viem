import { Account, Client, http, publicActions, walletActions } from 'viem'
import { mainnet } from 'viem/chains'

export const client = Client.create({
  account: Account.fromPrivateKey(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  ),
  chain: mainnet,
  transport: http('http://anvil:8545'),
})
  .extend(publicActions())
  .extend(walletActions())
