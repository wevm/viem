import { bench, describe } from 'vitest'
import { utils } from 'ethers'
import Web3 from 'web3'

import { formatUnits } from './formatUnits'

const web3 = new Web3()

describe('Format Unit', () => {
  bench('viem: `formatUnits`', () => {
    formatUnits(40000000000000000000n, 18)
  })

  bench('ethers: `formatUnits`', () => {
    utils.formatUnits(40000000000000000000n, 18)
  })

  bench('web3.js: `toWei`', () => {
    web3.utils.toWei('40000000000000000000')
  })
})
