import 'viem/window'
import { useEffect } from 'react'

import { fetchBlockNumber } from 'viem/actions'
import { alchemyProvider } from 'viem/providers/network'
import { mainnet, polygon } from 'viem/chains'

const provider = alchemyProvider({ chains: [mainnet] })

export default function Index() {
  useEffect(() => {
    ;(async () => {
      const blockNumber = await fetchBlockNumber(provider(polygon))
      console.log(blockNumber)
    })()
  }, [])
  return null
}
