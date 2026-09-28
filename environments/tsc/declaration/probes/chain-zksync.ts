import { Chain } from 'viem'
import { zksync } from 'viem/chains'

export const customZksync = Chain.from({
  ...zksync,
  id: 123_459,
  name: 'Custom ZKsync',
})
