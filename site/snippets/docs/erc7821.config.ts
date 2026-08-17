// [!region setup]
import { Account, Client, erc7821Actions, http } from 'viem'
import { mainnet } from 'viem/chains'

export const client = Client.create({
  account: Account.fromPrivateKey('0x...'),
  chain: mainnet,
  transport: http(),
}).extend(erc7821Actions())
// [!endregion setup]
