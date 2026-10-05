import { Chain } from 'viem'
import { tempo } from 'viem/chains'

export const customTempo = Chain.from({
  ...tempo,
  id: 123_457,
  name: 'Custom Tempo',
})
