import { bench, describe } from 'vitest'

import { accounts, ethersProvider, publicClient } from '../../../test'
import { parseEther } from '../../utils'

import { estimateGas } from './estimateGas'

describe('Estimate Gas', () => {
  bench('viem: `estimateGas`', async () => {
    await estimateGas(publicClient, {
      request: {
        from: accounts[0].address,
        to: accounts[1].address,
        value: parseEther('1'),
      },
    })
  })

  bench('ethers: `estimateGas`', async () => {
    await ethersProvider.estimateGas({
      from: accounts[0].address,
      to: accounts[1].address,
      value: parseEther('1'),
    })
  })
})
