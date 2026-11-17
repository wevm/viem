// `testActions` declares the `~schema` marker, so this exercises `.extend`'s request
// schema widening on top of the decorator type.
import { Client, http, testActions } from 'viem'
import { mainnet } from 'viem/chains'

export const testClient = Client.create({
  chain: mainnet,
  transport: http(),
}).extend(testActions({ mode: 'anvil' }))
