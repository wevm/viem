import { bench, describe } from 'vitest'

import {
  accounts,
  ethersProvider,
  ethersV6Provider,
  publicClient,
} from '../../_test.js'
import { getAccount, parseEther } from '../../utils/index.js'

import { estimateGas } from './estimateGas.js'

describe.skip('Estimate Gas', () => {
  bench('viem: `estimateGas`', async () => {
    await estimateGas(publicClient, {
      account: getAccount(accounts[0].address),
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
