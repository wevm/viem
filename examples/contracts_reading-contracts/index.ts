import { http, createPublicClient } from 'viem'
import { mainnet } from 'viem/chains'
import { wagmiContract } from './contract'

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})

const address = '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC'

// Note: this is a naive example – you should probably use multicall for these
// types of batched reads instead.
const [name, totalSupply, symbol, tokenUri, balance] = await Promise.all([
  client.readContract({
    ...wagmiContract,
    functionName: 'name',
  }),
  client.readContract({
    ...wagmiContract,
    functionName: 'totalSupply',
  }),
  client.readContract({
    ...wagmiContract,
    functionName: 'symbol',
  }),
  client.readContract({
    ...wagmiContract,
    functionName: 'tokenURI',
    args: [420n],
  }),
  client.readContract({
    ...wagmiContract,
    functionName: 'balanceOf',
    args: [address],
  }),
])

export default [
  `Contract Address: ${wagmiContract.address}`,
  `Name: ${name}`,
  `Total Supply: ${totalSupply}`,
  `Symbol: ${symbol}`,
  `Token URI of #420: ${tokenUri}`,
  `Balance of ${address}: ${balance}`,
]
