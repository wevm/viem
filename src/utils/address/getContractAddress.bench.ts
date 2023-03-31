import { bench, describe } from 'vitest'
import { utils } from 'ethers'

import { getContractAddress } from './getContractAddress.js'

describe.skip('Get Contract Address (CREATE)', () => {
  bench('viem: getContractAddress', () => {
    getContractAddress({
      from: '0xc961145a54C96E3aE9bAA048c4F4D6b04C13916b',
      nonce: 69420n,
    })
  })

  bench('ethers: getContractAddress', () => {
    utils.getContractAddress({
      from: '0xc961145a54C96E3aE9bAA048c4F4D6b04C13916b',
      nonce: 69420n,
    })
  })
})
