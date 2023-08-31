import { http, createPublicClient } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})

const address = await client.getEnsAddress({ name: 'jxom.eth' })
const name = await client.getEnsName({
  address: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
})

export default [`Address: ${address}`, `Name: ${name}`]
