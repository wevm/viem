import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { AbiFunction, Abis, type Address } from 'viem/utils'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

const token = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'

export async function example() {
  const getBalance = async (holder: Address.Address) => {
    const { data } = await Actions.call(client, {
      data: AbiFunction.encodeData(Abis.erc20, 'balanceOf', [holder]),
      to: token,
    })
    if (!data) throw new Error('No return data.')
    return AbiFunction.decodeResult(Abis.erc20, 'balanceOf', data)
  }

  const [recipientBalance, whaleBalance] = await Promise.all([
    getBalance('0x4242424242424242424242424242424242424242'),
    getBalance('0x28C6c06298d514Db089934071355E5743bf21d60'),
  ])
  return { recipientBalance, whaleBalance }
}
