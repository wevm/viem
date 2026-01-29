import { http, createPublicClient } from 'viem'
import { mainnet } from 'viem/chains'
import { normalize } from 'viem/ens'

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})

const address = await client.getEnsAddress({ name: 'jxom.eth' })
const name = await client.getEnsName({
  address: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
})

const resolverAddress = await client.getEnsResolver({
  name: normalize('jxom.eth'),
})

export default [
  `Address: ${address}`,
  `Name: ${name}, Resolver: ${resolverAddress}`,
]
