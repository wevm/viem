// wevm/viem#2778 (TS7056): a function returning a test client extended with public and
// wallet actions — the declaration-size failure mode, distinct from TS2742.
import { Client, http, publicActions, testActions, walletActions } from 'viem'
import { mainnet } from 'viem/chains'

export function client() {
  return Client.create({ chain: mainnet, transport: http() })
    .extend(testActions({ mode: 'anvil' }))
    .extend(publicActions())
    .extend(walletActions())
}
