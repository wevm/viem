import { http, createPublicClient } from 'viem'
import { mainnet } from 'viem/chains'
import { wagmiContract } from './contract'

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})

const address = '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC'

const [name, totalSupply, symbol, tokenUri, balance] = (
  await client.multicall({
    contracts: [
      {
        ...wagmiContract,
        functionName: 'name',
      },
      {
        ...wagmiContract,
        functionName: 'totalSupply',
      },
      {
        ...wagmiContract,
        functionName: 'symbol',
      },
      {
        ...wagmiContract,
        functionName: 'tokenURI',
        args: [420n],
      },
      {
        ...wagmiContract,
        functionName: 'balanceOf',
        args: [address],
      },
    ],
  })
).map((v) => v.result)

export default [
  `Contract Address: ${wagmiContract.address}`,
  `Name: ${name}`,
  `Total Supply: ${totalSupply}`,
  `Symbol: ${symbol}`,
  `Token URI of #420: ${tokenUri}`,
  `Balance of ${address}: ${balance}`,
]
