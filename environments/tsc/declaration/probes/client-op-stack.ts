// A client bound to a serializer-bearing chain (wevm/viem#1842 was celo; OP Stack is
// the v3 equivalent).
import { Client, http, publicActions } from 'viem'
import { optimism } from 'viem/chains'

export const client = Client.create({
  chain: optimism,
  transport: http(),
}).extend(publicActions())
