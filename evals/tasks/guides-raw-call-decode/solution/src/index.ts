import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { Hex } from 'viem/utils'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

const token = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'

async function getBalance(holder: `0x${string}`) {
  const { data } = await Actions.call(client, {
    data: Hex.concat('0x70a08231', Hex.padLeft(holder, 32)),
    to: token,
  })
  if (!data) throw new Error('no return data')
  return Hex.toBigInt(data)
}

export async function example() {
  const [recipientBalance, whaleBalance] = await Promise.all([
    getBalance('0x4242424242424242424242424242424242424242'),
    getBalance('0x28C6c06298d514Db089934071355E5743bf21d60'),
  ])
  return { recipientBalance, whaleBalance }
}
