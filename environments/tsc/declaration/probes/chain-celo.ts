import { Chain } from 'viem'
import { celo } from 'viem/chains'

export const customCelo = Chain.from({
  ...celo,
  id: 123_458,
  name: 'Custom Celo',
})
