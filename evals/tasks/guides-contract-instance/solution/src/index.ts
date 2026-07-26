import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

const holder = '0x28C6c06298d514Db089934071355E5743bf21d60'
const token = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'

export async function example() {
  const { decimals, symbol } = await Actions.token.getMetadata(client, {
    token,
  })
  const [{ amount: holderBalance }, { result: transferOk }] = await Promise.all(
    [
      Actions.token.getBalance(client, {
        account: holder,
        decimals,
        token,
      }),
      Actions.token.transfer.simulate(client, {
        account: holder,
        amount: 1_234_567n,
        to: '0x4242424242424242424242424242424242424242',
        token,
      }),
    ],
  )
  return { decimals, holderBalance, symbol, transferOk }
}
