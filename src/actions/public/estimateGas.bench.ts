import { ethersProvider, ethersV6Provider } from '../../_test/bench.js'
import { accounts } from '../../_test/constants.js'
import { publicClient } from '../../_test/utils.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { estimateGas } from './estimateGas.js'
import { bench, describe } from 'vitest'

describe.skip('Estimate Gas', () => {
  bench('viem: `estimateGas`', async () => {
    await estimateGas(publicClient, {
      account: accounts[0].address,
      to: accounts[1].address,
      value: parseEther('1'),
    })
  })

  bench('ethers@5: `estimateGas`', async () => {
    await ethersProvider.estimateGas({
      from: accounts[0].address,
      to: accounts[1].address,
      value: parseEther('1'),
    })
  })

  bench('ethers@6: `estimateGas`', async () => {
    await ethersV6Provider.estimateGas({
      from: accounts[0].address,
      to: accounts[1].address,
      value: parseEther('1'),
    })
  })
})
