import { Actions, Client, http, Token } from 'viem'
import { mainnet } from 'viem/chains'

const vusd = Token.from({
  addresses: { 1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
  currency: 'USD',
  decimals: 6,
  name: 'Vault USD',
  symbol: 'VUSD',
})

const client = Client.create({
  chain: mainnet,
  tokens: [vusd],
  transport: http('http://anvil:8545'),
})

export function example() {
  return Actions.token.getBalance(client, {
    account: '0x28C6c06298d514Db089934071355E5743bf21d60',
    token: 'vusd',
  })
}
