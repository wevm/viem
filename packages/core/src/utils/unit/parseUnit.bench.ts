import { bench, describe } from 'vitest'
import { utils } from 'ethers'
import Web3 from 'web3'
import { etherToWei } from 'essential-eth'

import { parseUnit } from './parseUnit'

const web3 = new Web3()

describe('Parse Unit', () => {
  bench('viem: `parseUnit`', () => {
    parseUnit('40', 18)
  })

  bench('ethers: `parseUnits`', () => {
    utils.parseUnits('40', 18)
  })

  bench('web3.js: `fromWei`', () => {
    web3.utils.fromWei('40')
  })

  bench('essential-eth: `etherToWei`', () => {
    etherToWei('40')
  })
})
