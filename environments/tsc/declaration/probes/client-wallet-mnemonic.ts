// wevm/viem#3661: a default-exported wallet client with a mnemonic account leaked
// EIP-7702 authorization types.
import { Account, Client, http, walletActions } from 'viem'
import { mainnet } from 'viem/chains'

export default Client.create({
  account: Account.fromMnemonic(
    'test test test test test test test test test test test junk',
  ),
  chain: mainnet,
  transport: http(),
}).extend(walletActions())
