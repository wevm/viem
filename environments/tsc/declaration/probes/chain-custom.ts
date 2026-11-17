import { Chain } from 'viem'
import { mainnet } from 'viem/chains'

export const customMainnet = Chain.from({
  ...mainnet,
  id: 123_456,
  name: 'Custom Mainnet',
})
