import { bench, describe } from 'vitest'

import { ethersProvider } from '~test/src/bench.js'
import { accounts } from '~test/src/constants.js'
import { parseEther } from '../../utils/unit/parseEther.js'

import { anvilMainnet } from '../../../test/src/anvil.js'

import { estimateGas } from './estimateGas.js'

const client = anvilMainnet.getClient()

describe.skip('Estimate Gas', () => {
  bench('viem: `estimateGas`', async () => {
    await estimateGas(client, {
      account: accounts[0].address,
      to: accounts[1].address,
      value: parseEther('1'),
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
