// Depth stress (TS2589/TS7056 class): the `extended` intersection and request schema
// widen with every decorator, plus a custom extension on top.
import {
  Account,
  Client,
  erc7821Actions,
  http,
  publicActions,
  testActions,
  walletActions,
} from 'viem'
import { mainnet } from 'viem/chains'

export const client = Client.create({
  account: Account.fromPrivateKey(
    '0x0000000000000000000000000000000000000000000000000000000000000001',
  ),
  chain: mainnet,
  transport: http(),
})
  .extend(testActions({ mode: 'anvil' }))
  .extend(publicActions())
  .extend(walletActions())
  .extend(erc7821Actions())
  .extend((base) => ({
    getBlockNumberTwice: async () => {
      const a = await base.block.getNumber()
      const b = await base.block.getNumber()
      return [a, b] as const
    },
  }))
